const ErrorHandler = require("../utils/errorHandler.js");
const cartModel = require("../models/cart.js");
const shopModel = require("../models/shop.js");
const productModel = require("../models/product.js");

/**
 * @description create cart
 * @param route POST /api/v1/user/profile/cart
 * @param access user
 */
exports.addToCart = async (req, res, next) => {
  try {

    var shop = null;
    var product = null;
    var cart = null;

    if(req.user){
    cart = await cartModel.find({
        customerId: req.user.id
    });
    }else{
        return next(new ErrorHandler(`user not found`, 403));
    }

    if(req.body.shopId){
        shop = await shopModel.findById(req.body.shopId);
    }else{
        return next(new ErrorHandler(`Bad Request shop required`, 403));
    }

    if(req.body.productId){
        product = await productModel.findById(req.body.productId)
    }else{
        return next(new ErrorHandler(`Bad Request product required`, 403));
    }

    if(product.shop != req.body.shopId){
        return next(new ErrorHandler(`Bad Request wrong shop`, 403));
    }

    if(cart.length === 0){
        console.log("saving cart")
        cart = await cartModel.create({
            customerId: req.user.id,
            shopId: shop,
            products: { product:product, qty:1},
            amount: product.price
          });
    }else{
        cart=cart[0]
        if(cart.shopId == req.body.shopId){
            if(cart.products.find(p => p.product == product.id)){
                index = search(product.id, cart.products)
                if(product.availableQty >= cart.products[index].qty+1){
                    cart.products[index].qty=cart.products[index].qty+1;
                    cart.amount = cart.amount + product.price;
                }else{
                    return next(new ErrorHandler(`Product not available`, 403));
                }
            }else{
                cart.products.push({product, qty:1})
            }
        }else{
            cart.shopId=req.body.shopId;
            cart.products=[]
            cart.products.push({product, qty:1});
            cart.amount=product.price;
        }
        cart = await cartModel.updateOne(cart)
    }
    this.getCart(req, res, next);
  } catch (error) {
    next(error);
  }
};

/**
 * @description get cart
 * @param route GET /api/v1/user/profile/cart
 * @param access user
 */
 exports.getCart = async (req, res, next) => {
    try {
      if(req.user){
      cart = await cartModel.find({
          customerId: req.user.id
      });
      if(cart.length == 0){
        res.status(200).json({
            sucess: true,
            body: null,
        })
          return 
      }
      cart=cart[0]

      shop = await shopModel.findById(cart.shopId)
     
      products = [];
      for(i=0; i<cart.products.length; i++){
        product = await productModel.findById(cart.products[i].product)
        products.push({product:product, qty:cart.products[i].qty});
      }

      res.status(200).json({
        sucess: true,
        body: {customer:cart.customerId, shop:shop, products: products, amount:cart.amount},
    })
     }
    } catch (error) {
      next(error);
    }
  };

/**
 * @description delete cart
 * @param route DELETE /api/v1/user/profile/cart
 * @param access user
 */
 exports.removeFromCart = async (req, res, next) => {
    try {
        if(req.body.productId){
            product = await productModel.findById(req.body.productId)
        }else{
            return next(new ErrorHandler(`Bad Request product required`, 403));
        }

        if(req.user){
        cart = await cartModel.find({
           customerId: req.user.id
        });


        cart=cart[0]
        if(cart.products.length==0){
            return next(new ErrorHandler(`Cart Empty`, 403));
        }

        index = search(product.id, cart.products)
        if(cart.products[index].qty-1>=0){
            cart.products[index].qty=cart.products[index].qty-1;
            cart.amount = cart.amount - product.price;
            if(cart.products[index].qty == 0){
                cart.products.splice(index, 1);
                cart.shopId=null
            }
        }else{
            return next(new ErrorHandler(`Product already 0`, 403));
        }

        cart = await cartModel.updateOne(cart)

      this.getCart(req, res, next)
     }
    } catch (error) {
      next(error);
    }
  };

function search(product, products) {
    for(var i=0; i<products.length; i++){
        if(products[i].product == product){
            return i;
        }
    }
    return -1;
}