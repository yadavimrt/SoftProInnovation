const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const razorpayInstance = require("../utils/Razorpay");
const Order = require("../model/Order");
const User = require("../model/User");
const Address = require("../model/Address");
const Cart = require("../model/Cart");
const sendEmail = require("../utils/Email");
const { generateOrderConfirmationEmail } = require("../utils/emailTemplates");

// Helper to extract authenticated user from header or body
const resolveUser = async (req) => {
  let userId = req.body?.user_id;

  if (!userId && req.headers.authorization) {
    try {
      const token = req.headers.authorization.replace(/^Bearer\s+/i, "");
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "ocCzmUh4OjfpybPJfx4chY5gUkmOfJ2dmjSwlJHfiSU"
      );
      userId = decoded?.userId || decoded?.id;
    } catch {
      // Invalid/expired token
    }
  }

  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    return await User.findById(userId).select("name email mobile");
  }

  return null;
};

// 1. Create Razorpay order and save initial pending Order in MongoDB
router.post("/create-order", async (req, res) => {
  try {
    const {
      amount,
      totalAmount,
      subtotal,
      fee = 0,
      discount = 0,
      items,
      address: reqAddress,
      addressId,
    } = req.body;

    // Resolve user
    const user = await resolveUser(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User authentication required. Please log in.",
      });
    }

    // Resolve delivery address
    let resolvedAddress = reqAddress;
    if (
      !resolvedAddress ||
      !resolvedAddress.name ||
      !resolvedAddress.address ||
      !resolvedAddress.city
    ) {
      if (addressId && mongoose.Types.ObjectId.isValid(addressId)) {
        resolvedAddress = await Address.findById(addressId);
      }
      if (!resolvedAddress) {
        resolvedAddress =
          (await Address.findOne({ user_id: user._id, isdefault: "yes" })) ||
          (await Address.findOne({ user_id: user._id }));
      }
    }

    if (
      !resolvedAddress ||
      !resolvedAddress.name ||
      !resolvedAddress.mobile ||
      (!resolvedAddress.address && !resolvedAddress.Address) ||
      !resolvedAddress.city ||
      !resolvedAddress.state ||
      !resolvedAddress.pincode
    ) {
      return res.status(400).json({
        success: false,
        error: "A valid delivery address with all required fields is required.",
      });
    }

    // Resolve items
    let rawItems = Array.isArray(items) && items.length > 0 ? items : null;
    if (!rawItems) {
      const cartDocs = await Cart.find({ user_id: user._id }).populate("product_id");
      if (cartDocs.length > 0) {
        rawItems = cartDocs.map((c) => ({
          _id: c.product_id?._id,
          name: c.product_id?.name || "Product",
          thumbnail: c.product_id?.thumbnail || "",
          category: c.product_id?.category || "",
          price: c.product_id?.price || 0,
          quantity: c.quantity || 1,
        }));
      }
    }

    if (!rawItems || rawItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Your cart is empty. Please add items to cart before checkout.",
      });
    }

    const orderItems = rawItems.map((item) => {
      const price = Number(item.price) || 0;
      const quantity = Math.max(Number(item.quantity) || 1, 1);
      return {
        product_id: mongoose.Types.ObjectId.isValid(item._id || item.id || item.product_id)
          ? item._id || item.id || item.product_id
          : undefined,
        name: item.name || "Product",
        thumbnail: item.thumbnail || "",
        category: item.category || "",
        price,
        quantity,
        total: price * quantity,
      };
    });

    // Compute final monetary amounts
    const finalTotal = Number(totalAmount || amount || 0);
    if (finalTotal <= 0) {
      return res.status(400).json({
        success: false,
        error: "Order amount must be greater than zero.",
      });
    }

    // Razorpay requires amount in smallest currency unit (paise for INR)
    const amountInPaise = Math.round(finalTotal * 100);

    const rzpOptions = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    };

    // Call Razorpay API to generate the gateway order
    const rzpOrder = await razorpayInstance.orders.create(rzpOptions);

    // Persist full order in database with pending payment status
    const dbOrder = await Order.create({
      razorpayOrderId: rzpOrder.id,
      currency: rzpOrder.currency || "INR",
      user_id: user._id,
      customerName: user.name || resolvedAddress.name || "Customer",
      customerEmail: user.email || "",
      customerMobile: user.mobile || resolvedAddress.mobile || "",
      items: orderItems,
      address: {
        name: resolvedAddress.name,
        mobile: String(resolvedAddress.mobile),
        pincode: String(resolvedAddress.pincode),
        locality: resolvedAddress.locality || resolvedAddress.localiy || "",
        address: resolvedAddress.address || resolvedAddress.Address,
        city: resolvedAddress.city,
        state: resolvedAddress.state,
        landmark: resolvedAddress.landmark || "",
        addressType: resolvedAddress.addressType || "Home",
      },
      subtotal: Number(subtotal) || (finalTotal - Number(fee) + Number(discount)),
      fee: Number(fee) || 0,
      discount: Number(discount) || 0,
      totalAmount: finalTotal,
      paymentMethod: "razorpay",
      paymentStatus: "pending",
      status: "pending",
    });

    return res.json({
      success: true,
      orderId: rzpOrder.id,
      dbOrderId: dbOrder.orderId,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Razorpay create-order error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to initiate Razorpay order",
    });
  }
});

// 2. Verify payment signature after checkout success
router.post("/verify-payment", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification parameters",
      });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(body)
      .digest("hex");

    const isValid = expectedSignature === razorpay_signature;

    if (isValid) {
      const order = await Order.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        {
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          paymentTransactionId: razorpay_payment_id,
          paymentStatus: "paid",
          status: "processing",
        },
        { returnDocument: 'after' }
      );

      // Clean up server-side cart if exists for user
      if (order?.user_id) {
        await Cart.deleteMany({ user_id: order.user_id }).catch(() => {});
      }

      // Dispatch executive order confirmation receipt in background
      const recipientEmail = order?.customerEmail;
      if (recipientEmail && order) {
        const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
        const confirmation = generateOrderConfirmationEmail(order, clientUrl);
        sendEmail(recipientEmail, confirmation.subject, confirmation.html).catch((err) => {
          console.error("Razorpay order confirmation email async error:", err);
        });
      }

      return res.json({
        success: true,
        message: "Payment verified successfully",
        order,
      });
    }

    // Invalid signature: update record to failed
    await Order.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { paymentStatus: "failed" }
    );

    return res.status(400).json({
      success: false,
      message: "Invalid payment signature verification",
    });
  } catch (err) {
    console.error("Razorpay verify-payment error:", err);
    return res.status(500).json({
      success: false,
      error: "Verification failed",
      message: err.message,
    });
  }
});

module.exports = router;