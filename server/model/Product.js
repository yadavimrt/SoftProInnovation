const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    shortdescription: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      required: true,
    },

    compareprice: {
      type: Number,
      required: true,
    },

    costprice: {
      type: Number,
      required: true,
    },

    stockquantity: {
      type: Number,
      default: 0,
    },

    stockstatus: {
      type: String,
      required: true,
    },

    refundpolicy: {
      type: String,
      required: true,
    },

    iscouponavailable: {
      type: Boolean,
      default: false,
    },

    isrefundable_replacement: {
      type: Boolean,
      default: false,
    },

    isfreedelivery: {
      type: Boolean,
      default: false,
    },

    refund_days: {
      type: Number,
      required: true,
    },

    isreplaceable: {
      type: Boolean,
      default: false,
    },

    images: {
      type: [String],
      required: true,
    },

    thumbnail: {
      type: String,
      required: true,
    },

    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    height: {
      type: Number,
      required: true,
    },

    width: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    is_feature: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;