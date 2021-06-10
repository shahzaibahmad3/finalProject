const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    unique: true,
    required: [true, "Please add a Product name"],
  },
  description: {
    type: String,
    required: [true, "Please add a description"],
  },
  image: {
    type: String,
  },
  price: {
    type: Number,
    required: [true, "Please add a price"],
  },
  availableQty: {
    type: Number,
    default: 0,
  },
  qty: {
    type: Number,
    default: 0,
  },
  shop: {
    type: mongoose.Schema.ObjectId,
    ref: "Shop",
    required: true,
  },
});

module.exports = mongoose.model("Product", ProductSchema);
