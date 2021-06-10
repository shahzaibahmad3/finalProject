const express = require("express");
const { getProducts, createProduct } = require("../controllers/product");
const { protectRoute, authorize } = require("../middleware/auth.js");

const router = express.Router({ mergeParams: true });

router
  .route("/:shopId/product")
  .get(getProducts)
  .post(protectRoute, authorize("shopowner"), createProduct);

module.exports = router;
