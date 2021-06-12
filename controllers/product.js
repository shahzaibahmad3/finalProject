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

/**
 * @description upload photo of product
 * @param route PUT /api/v1/:id/product/photo
 * @param access PRIVATE
 */
exports.uploadPhotoProduct = async (req, res, next) => {
  try {
    const product = await productModel.findById(req.params.id);

    req.body.shop = product.shop;

    //get user of that shop and check whether the current user is same to it
    const shop = await shopModel.findById(req.body.shop);

    if (!shop) {
      return next(
        new ErrorHandler(`Product not found at id ${req.params.id}`, 400)
      );
    }

    console.log(shop.user);
    console.log(req.user.id);

    if (shop) {
      if (shop.user != req.user.id) {
        return next(new ErrorHandler(`Not a owner for this shop`, 403));
      }
    } else {
      return next(new ErrorHandler(`Shop not found`, 403));
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
    file.name = `photo_${product._id}${path.parse(file.name).ext}`;

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
      if (err) {
        return next(new ErrorHandler(`problem with file upload`, 500));
      }

      await productModel.findByIdAndUpdate(product._id, {
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
