const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  name: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
  },
  category: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  total: {
    type: Number,
    required: true,
  },
});

const addressSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  pincode: {
    type: String,
    required: true,
  },
  locality: {
    type: String,
  },
  landmark: {
    type: String,
  },
  addressType: {
    type: String,
    enum: ["Home", "Work", "Other"],
    default: "Home",
  },
});

const orderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      required: true,
    },
    customerMobile: {
      type: String,
      required: true,
    },
    items: [orderItemSchema],
    address: addressSchema,
    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },
    fee: {
      type: Number,
      required: true,
      default: 0,
    },
    discount: {
      type: Number,
      required: true,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "razorpay", "payu"],
      default: "cod",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "completed", "failed", "refunded"],
      default: "pending",
    },
    status: {
      type: String,
      enum: ["pending", "processing", "confirmed", "shipped", "delivered", "cancelled", "returned"],
      default: "pending",
    },
    orderId: {
      type: String,
      sparse: true,
      index: true,
    },
    orderNumber: {
      type: String,
      sparse: true,
      index: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    razorpayOrderId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },
    razorpaySignature: {
      type: String,
    },
    paymentTransactionId: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

// Auto-generate orderId and orderNumber if not present (Mongoose 9 synchronous/promise hook)
orderSchema.pre("save", function () {
  if (!this.orderId) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(1000 + Math.random() * 9000);
    this.orderId = `ORD-${timestamp}-${random}`;
  }
  if (!this.orderNumber) {
    this.orderNumber = this.orderId;
  }
});

module.exports = mongoose.model("Order", orderSchema);
