const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const CartSchema = new mongoose.Schema({
  customerId: {
      type:Schema.Types.ObjectId, 
      ref: "User",
      required: true
  },
  shopId :{
    type: mongoose.Schema.ObjectId,
    ref: "Shop",
    required: true,
  },
  products: [
     { product: {
        type:Schema.Types.ObjectId, 
        ref: "Product",
        required: true,
      },
      qty: {
        type: Number,
        default: 0,
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


module.exports = mongoose.model("Cart", CartSchema);
