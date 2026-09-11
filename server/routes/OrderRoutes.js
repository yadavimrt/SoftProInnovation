const express = require("express");
const mongoose = require("mongoose");
const crypto = require("crypto");
const Order = require("../model/Order");
const User = require("../model/User");
const sendEmail = require("../utils/Email");
const {
  generateOrderConfirmationEmail,
  generateOrderStatusUpdateEmail,
} = require("../utils/emailTemplates");

const Router = express.Router();

Router.post("/create", async (req, res) => {
  try {
    const {
      user_id,
      items,
      address,
      subtotal,
      fee,
      discount,
      totalAmount,
      paymentMethod,
    } = req.body;

    if (!user_id || !mongoose.Types.ObjectId.isValid(user_id)) {
      return res
        .status(400)
        .json({ success: false, message: "Valid user ID is required" });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Order must contain at least one item",
        });
    }
    if (
      !address?.name ||
      !address?.mobile ||
      !address?.address ||
      !address?.city ||
      !address?.state ||
      !address?.pincode
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Complete delivery address is required",
        });
    }

    const user = await User.findById(user_id).select("name email mobile");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const orderItems = items.map((item) => {
      const price = Number(item.price) || 0;
      const quantity = Math.max(Number(item.quantity) || 1, 1);
      return {
        product_id: mongoose.Types.ObjectId.isValid(item._id || item.id)
          ? item._id || item.id
          : undefined,
        name: item.name || "Product",
        thumbnail: item.thumbnail || "",
        category: item.category || "",
        price,
        quantity,
        total: price * quantity,
      };
    });

    const order = await Order.create({
      user_id,
      customerName: user.name,
      customerEmail: user.email,
      customerMobile: user.mobile || address.mobile,
      items: orderItems,
      address: {
        name: address.name,
        mobile: String(address.mobile),
        pincode: String(address.pincode),
        locality: address.locality || address.localiy || "",
        address: address.address || address.Address,
        city: address.city,
        state: address.state,
        landmark: address.landmark || "",
        addressType: address.addressType || "Home",
      },
      subtotal: Number(subtotal) || 0,
      fee: Number(fee) || 0,
      discount: Number(discount) || 0,
      totalAmount: Number(totalAmount) || 0,
      paymentMethod: paymentMethod === "payu" ? "payu" : "cod",
      paymentStatus: "pending",
      status: "pending",
    });

    // Dispatch executive order confirmation receipt in background for COD orders
    const recipientEmail = order.customerEmail || user.email;
    if (recipientEmail && order.paymentMethod === "cod") {
      const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
      const confirmation = generateOrderConfirmationEmail(order, clientUrl);
      sendEmail(recipientEmail, confirmation.subject, confirmation.html).catch((err) => {
        console.error("Async order confirmation email error:", err);
      });
    }

    return res
      .status(201)
      .json({ success: true, message: "Order placed successfully", order });
  } catch (error) {
    console.error("Create order error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to place order",
        error: error.message,
      });
  }
});
Router.post("/payu/initiate", async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findOne({ orderId }).populate(
      "user_id",
      "name email mobile"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // PayU credentials
    const key =
      process.env.PAYU_MERCHANT_KEY ||
      process.env.PAYU_KEY;

    const salt =
      process.env.PAYU_MERCHANT_SALT ||
      process.env.PAYU_SALT;

    if (!key || !salt) {
      return res.status(503).json({
        success: false,
        message: "PayU credentials are not configured on the server",
      });
    }

    // URLs
    const clientUrl =
      process.env.CLIENT_URL ||
      "http://localhost:5173";

    const serverUrl =
      process.env.SERVER_URL ||
      "http://localhost:5000";

    const callbackUrl =
      `${serverUrl}/api/order/payu/callback`;

    // Transaction ID
    const txnid = order.orderId;

    // Amount
    const amount = Number(order.totalAmount).toFixed(2);

    // Product information
    const productinfo =
      `SoftPro order ${order.orderId}`;

    // Customer details
    const firstname =
      order.customerName ||
      order.address?.name ||
      order.user_id?.name ||
      "Customer";

    const email =
      order.customerEmail ||
      order.user_id?.email ||
      "customer@example.com";

    const phone =
      order.customerMobile ||
      order.address?.mobile ||
      order.user_id?.mobile ||
      "";

    // UDF values
    const udf1 = order._id.toString();
    const udf2 = clientUrl;
    const udf3 = "";
    const udf4 = "";
    const udf5 = "";

    /*
      PayU Hash Formula:

      sha512(
        key|
        txnid|
        amount|
        productinfo|
        firstname|
        email|
        udf1|
        udf2|
        udf3|
        udf4|
        udf5|
        ||||||SALT
      )
    */

    const hashString =
      `${key}|` +
      `${txnid}|` +
      `${amount}|` +
      `${productinfo}|` +
      `${firstname}|` +
      `${email}|` +
      `${udf1}|` +
      `${udf2}|` +
      `${udf3}|` +
      `${udf4}|` +
      `${udf5}` +
      `||||||` +
      `${salt}`;

    console.log("========== PAYU DEBUG ==========");
    console.log("TXN ID:", txnid);
    console.log("Amount:", amount);
    console.log("Product:", productinfo);
    console.log("Firstname:", firstname);
    console.log("Email:", email);
    console.log("Phone:", phone);
    console.log("UDF1:", udf1);
    console.log("UDF2:", udf2);
    console.log("Hash String:", hashString);

    // Generate SHA-512 hash
    const hash = crypto
      .createHash("sha512")
      .update(hashString, "utf8")
      .digest("hex");

    console.log("Generated Hash:", hash);
    console.log("================================");

    // Save PayU transaction ID
    order.paymentTransactionId = txnid;
    await order.save();

    // PayU endpoint
    const action =
      process.env.PAYU_ENDPOINT ||
      (
        process.env.PAYU_ENV === "production"
          ? "https://secure.payu.in/_payment"
          : "https://test.payu.in/_payment"
      );

    return res.json({
      success: true,

      action,

      fields: {
        key,
        txnid,
        amount,
        productinfo,
        firstname,
        email,
        phone,

        surl: callbackUrl,
        furl: callbackUrl,

        udf1,
        udf2,
        udf3,
        udf4,
        udf5,

        hash,
      },
    });

  } catch (error) {
    console.error(
      "PayU initiation error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to start PayU payment",
    });
  }
});

Router.post("/payu/callback", async (req, res) => {
  try {
    const { txnid, status, hash, key, amount, productinfo, firstname, email } =
      req.body;
    const salt = process.env.PAYU_MERCHANT_SALT || process.env.PAYU_SALT;
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    if (!salt || !txnid)
      return res.redirect(`${clientUrl}/payment?status=failed`);

    const reverseHash = crypto
      .createHash("sha512")
      .update(
        `${salt}|${status || ""}|||||||||||${email || ""}|${firstname || ""}|${productinfo || ""}|${amount || ""}|${txnid}|${key || ""}`,
      )
      .digest("hex");
    const order = await Order.findOne({ orderId: txnid });
    if (!order || reverseHash !== hash)
      return res.redirect(`${clientUrl}/payment?status=failed`);

    order.paymentStatus = status === "success" ? "paid" : "failed";
    if (status === "success") {
      order.status = "processing";
    }
    order.paymentTransactionId = txnid;
    await order.save();

    if (status === "success") {
      const recipientEmail = order.customerEmail;
      if (recipientEmail) {
        const confirmation = generateOrderConfirmationEmail(order, clientUrl);
        sendEmail(recipientEmail, confirmation.subject, confirmation.html).catch((err) => {
          console.error("PayU success email async error:", err);
        });
      }
    }

    return res.redirect(
      `${clientUrl}/payment?status=${status === "success" ? "success" : "failed"}&order=${encodeURIComponent(order.orderId)}`,
    );
  } catch (error) {
    console.error("PayU callback error:", error);
    return res.redirect(
      `${process.env.CLIENT_URL || "http://localhost:5173"}/payment?status=failed`,
    );
  }
});

Router.get("/show", async (req, res) => {
  try {
    const filter =
      req.query.status && req.query.status !== "all"
        ? { status: req.query.status }
        : {};
    const orders = await Order.find(filter)
      .populate("user_id", "name email mobile")
      .sort({ createdAt: -1 });
    return res.status(200).json(orders);
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch orders",
        error: error.message,
      });
  }
});

Router.get("/user/:userId", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user ID" });
    }
    const user = await User.findById(req.params.userId);
    const query = user?.email
      ? { $or: [{ user_id: req.params.userId }, { customerEmail: user.email }] }
      : { user_id: req.params.userId };

    const orders = await Order.find(query).sort({
      createdAt: -1,
    });
    return res.status(200).json({ success: true, orders });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch user orders",
        error: error.message,
      });
  }
});

Router.get("/:id", async (req, res) => {
  try {
    const query = mongoose.Types.ObjectId.isValid(req.params.id)
      ? { $or: [{ _id: req.params.id }, { orderId: req.params.id }] }
      : { orderId: req.params.id };

    const order = await Order.findOne(query).populate(
      "user_id",
      "name email mobile status picture gender createdAt"
    );

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Retrieve full order history for this user
    let userOrders = [];
    if (order.user_id?._id) {
      userOrders = await Order.find({ user_id: order.user_id._id })
        .sort({ createdAt: -1 });
    } else if (order.customerEmail) {
      userOrders = await Order.find({ customerEmail: order.customerEmail })
        .sort({ createdAt: -1 });
    }

    const totalOrders = userOrders.length;
    const totalSpent = userOrders.reduce(
      (sum, o) => sum + (Number(o.totalAmount) || 0),
      0
    );

    // Filter out the current order to find previous / last order
    const otherOrders = userOrders.filter(
      (o) => o._id.toString() !== order._id.toString()
    );
    const lastOrder = otherOrders.length > 0 ? otherOrders[0] : null;

    return res.json({
      success: true,
      order,
      customerStats: {
        totalOrders,
        totalSpent,
        lastOrder,
        allOrders: userOrders.map((o) => ({
          _id: o._id,
          orderId: o.orderId,
          createdAt: o.createdAt,
          totalAmount: o.totalAmount,
          status: o.status,
          itemsCount: o.items?.length || 0,
          paymentMethod: o.paymentMethod,
          paymentStatus: o.paymentStatus,
        })),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: error.message,
    });
  }
});

Router.patch("/:id/status", async (req, res) => {
  try {
    const allowed = [
      "pending",
      "processing",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
      "returned",
    ];

    const updateData = {};
    if (req.body.status) {
      const s = String(req.body.status).toLowerCase();
      if (!allowed.includes(s)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid order status" });
      }
      updateData.status = s;
    }

    if (req.body.paymentStatus) {
      const p = String(req.body.paymentStatus).toLowerCase();
      if (!["pending", "paid", "completed", "failed", "refunded"].includes(p)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid payment status" });
      }
      updateData.paymentStatus = p;
    }

    if (Object.keys(updateData).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No valid fields provided to update" });
    }

    const query = mongoose.Types.ObjectId.isValid(req.params.id)
      ? { $or: [{ _id: req.params.id }, { orderId: req.params.id }] }
      : { orderId: req.params.id };

    const order = await Order.findOneAndUpdate(query, updateData, {
      new: true,
      runValidators: true,
    }).populate(
      "user_id",
      "name email mobile status picture gender createdAt"
    );

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // If order fulfillment status was updated, dispatch automated milestone notification email
    if (req.body.status) {
      const recipientEmail = order.customerEmail || order.user_id?.email;
      if (recipientEmail) {
        const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
        const statusEmail = generateOrderStatusUpdateEmail(order, req.body.status, clientUrl);
        sendEmail(recipientEmail, statusEmail.subject, statusEmail.html).catch((err) => {
          console.error(`Status update email error for order ${order.orderId}:`, err);
        });
      }
    }

    return res.json({ success: true, order });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update order",
      error: error.message,
    });
  }
});

module.exports = Router;
