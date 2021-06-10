const mongoose = require("mongoose");

const ShopSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    unique: true,
    required: [true, "Please add a shop name"],
  },
  image: {
    type: String,
  },
  rating: {
    type: Number,
    min: [1, "Rating cannot be less than 1"],
    max: [5, "Rating cannot be more than 5"],
  },
  open: {
    type: Boolean,
    required: [true, "please enter open/closed"],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
});

//Reverse Populate , means we have to show courses information in bootcamp
// so we are setting virtual to reverse populate bootcamp
ShopSchema.virtual("products", {
  ref: "Product",
  localField: "_id",
  foreignField: "shop",
  justOne: false,
});

module.exports = mongoose.model("Shop", ShopSchema);
