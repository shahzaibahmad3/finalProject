const express = require("express");
const {
  getShops,
  createShop,
  uploadPhotoShop,
  findShopByLocation,
} = require("../controllers/shop");
const { protectRoute, authorize } = require("../middleware/auth.js");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(getShops)
  .post(protectRoute, authorize("shopowner"), createShop);

router.route("/radius/:lat/:long").get(findShopByLocation);

router
  .route("/:id/photo")
  .put(protectRoute, authorize("shopowner"), uploadPhotoShop);

module.exports = router;
