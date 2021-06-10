const express = require("express");
const { getShops, createShop } = require("../controllers/shop");
const { protectRoute, authorize } = require("../middleware/auth.js");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(getShops)
  .post(protectRoute, authorize("shopowner"), createShop);

module.exports = router;
