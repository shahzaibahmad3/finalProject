const productModel = require("../models/product");
const shopModel = require("../models/shop.js");
const ErrorHandler = require("../utils/errorHandler.js");
const geocoder = require("../utils/geojsonDecoder.js");
const path = require("path");
/**
 * @description get all the products
 * @param route GET /api/v1/:shopId/product
 * @param access PUBLIC
 */
exports.getProducts = async (req, res, next) => {
  try {
    let shopId = req.params.shopId;

    const products = await productModel.find({ shop: shopId });

    res.status(200).json({
      sucess: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @description create a product
 * @param route POST /api/v1/:shopId/product
 * @param access PRIVATE
 */
exports.createProduct = async (req, res, next) => {
  try {
    req.body.shop = req.params.shopId;

    //get user of that shop and check whether the current user is same to it
    const shop = await shopModel.findById(req.body.shop);

    console.log(shop.user);
    console.log(req.user.id);

    if (shop) {
      if (shop.user != req.user.id) {
        return next(new ErrorHandler(`Not a owner for this shop`, 403));
      }
    } else {
      return next(new ErrorHandler(`Shop nopt found`, 403));
    }

    const product = await productModel.create(req.body);

    if (!product) {
      return next(new ErrorHandler(`Error occured for creating product`, 404));
    }

    res.status(201).json({
      sucess: true,
      data: product,
    });

    console.log(product);
  } catch (error) {
    next(error);
  }
};
