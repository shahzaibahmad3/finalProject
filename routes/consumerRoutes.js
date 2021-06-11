const express = require("express");
const { getUser } = require("../controllers/consumerController.js");
const { addToCart, getCart, removeFromCart } = require("../controllers/cartController.js");

const router = express.Router();
const { protectRoute } = require("../middleware/auth.js");

router.route("/user/profile").get(protectRoute, getUser);
router.route("/user/profile/cart").post(protectRoute, addToCart);
router.route("/user/profile/cart").get(protectRoute, getCart);
router.route("/user/profile/cart").delete(protectRoute, removeFromCart);

module.exports = router;
