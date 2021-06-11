const express = require("express");
const { getUser } = require("../controllers/consumerController.js");
const { addToCart, getCart, removeFromCart } = require("../controllers/cartController.js");
const { createOrder, getAllOrdersForCustomer } = require("../controllers/orderController.js");

const router = express.Router();
const { protectRoute, authorize } = require("../middleware/auth.js");

router.route("/user/profile").get(protectRoute, getUser);
router.route("/user/profile/cart").post(protectRoute, authorize("consumer"), addToCart);
router.route("/user/profile/cart").get(protectRoute, authorize("consumer"), getCart);
router.route("/user/profile/cart").delete(protectRoute, authorize("consumer"), removeFromCart);
router.route("/user/profile/cart/checkout").post(protectRoute, authorize("consumer"), createOrder);
router.route("/user/profile/orders").get(protectRoute, authorize("consumer"), getAllOrdersForCustomer);

module.exports = router;
