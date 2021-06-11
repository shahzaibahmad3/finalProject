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

/**
 * @description upload photo of shop
 * @param route PUT /api/v1/shop/:id/photo
 * @param access PRIVATE
 */
exports.uploadPhotoShop = async (req, res, next) => {
  try {

    req.body.shop = req.params.id;

    //get user of that shop and check whether the current user is same to it
    const shop = await shopModel.findById(req.body.shop);

    console.log(shop.user);
    console.log(req.user.id);

    if (shop) {
      if (shop.user != req.user.id) {
        return next(new ErrorHandler(`Not a owner for this shop`, 403));
      }
    } else {
      return next(new ErrorHandler(`Shop not found`, 403));
    }



    // const shop = await shopModel.findById(req.params.id);

    if (!shop) {
      return next(
        new ErrorHandler(`Shop not found at id ${req.params.id}`, 400)
      );
    }

    //make sure the user is owner
    if (shop.user.toString() !== req.user.id && req.user.role !== "shopowner") {
      return next(
        new ErrorHandler(
          `User ${req.user.id} is not authorised to update this resource`,
          401
        )
      );
    }

    if (!req.files) {
      return next(new ErrorHandler(`please upload a photo`, 400));
    }

    //make sure file is an image
    const file = req.files.file;
    if (!file.mimetype.startsWith("image")) {
      return next(new ErrorHandler(`please upload an image file`, 400));
    }

    //make sure image is less than 1mb
    if (file.size > process.env.MAX_FILE_UPLOAD) {
      return next(
        new ErrorHandler(
          `please upload a file less than ${process.env.MAX_FILE_UPLOAD}`,
          400
        )
      );
    }

    //CREATE a unique name for each image
    file.name = `photo_${shop._id}${path.parse(file.name).ext}`;

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
      if (err) {
        return next(new ErrorHandler(`problem with file upload`, 500));
      }
      await shopModel.findByIdAndUpdate(req.params.id, {
        image: file.name,
      });
      res.status(200).json({
        sucess: true,
        data: file.name,
      });
    });
  } catch (error) {
    next(error);
  }
};
