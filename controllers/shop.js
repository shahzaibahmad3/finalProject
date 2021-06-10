const shopModel = require("../models/shop.js");
const ErrorHandler = require("../utils/errorHandler.js");
const geocoder = require("../utils/geojsonDecoder.js");
const path = require("path");
/**
 * @description get all thr shops
 * @param route GET /api/v1/shops
 * @param access PUBLIC
 */
exports.getShops = async (req, res, next) => {
  try {
    const shops = await shopModel.find();

    res.status(200).json({
      sucess: true,
      data: shops,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @description create a shop
 * @param route POST /api/v1/shops
 * @param access PRIVATE
 */
exports.createShop = async (req, res, next) => {
  try {
    req.body.user = req.user.id;

    //find whether a shop exit or not
    const haveShop = await shopModel.findOne({ user: req.user.id });

    if (haveShop) {
      return next(new ErrorHandler(`cannot create more than one shop`, 403));
    }

    const shop = await shopModel.create(req.body);

    if (!shop) {
      return next(new ErrorHandler(`Error occured for creating shop`, 404));
    }

    res.status(201).json({
      sucess: true,
      data: shop,
    });

    console.log(shop);
  } catch (error) {
    next(error);
  }
};
