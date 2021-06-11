const express = require("express");
const {
  getProducts,
  createProduct,
  uploadPhotoProduct,
} = require("../controllers/product");
const { protectRoute, authorize } = require("../middleware/auth.js");
const { getAllOrdersForShop } = require("../controllers/orderController.js");

const router = express.Router({ mergeParams: true });

router
  .route("/:shopId/product")
  .get(getProducts)
  .post(protectRoute, authorize("shopowner"), createProduct)

router.route("/:shopId/orders").get(protectRoute, authorize("shopowner"), getAllOrdersForShop) 

router
  .route("/:id/product/photo")
  .put(protectRoute, authorize("shopowner"), uploadPhotoProduct);

module.exports = router;
