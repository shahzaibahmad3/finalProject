const ErrorHandler = require("../utils/errorHandler.js");
const cartModel = require("../models/cart.js");
const shopModel = require("../models/shop.js");
const productModel = require("../models/product.js");
const orderModel = require("../models/order.js");

/**
 * @description create order
 * @param route POST /api/v1/user/profile/cart/checkout
 * @param access user
 */
exports.createOrder = async (req, res, next) => {
  try {
    if(req.user){
        carts = await cartModel.find({
            customerId: req.user.id
        });
        cart=carts[0];

        const order = await orderModel.create({
            customerId:cart.customerId, 
            shopId:cart.shopId, 
            products:cart.products, 
            amount:cart.amount
        });
        if (!order) {
            return next(new ErrorHandler(`Error occured for creating order`, 404));
          }
      
          await cartModel.deleteOne(cart)
          res.status(201).json({
            sucess: true,
            data: order,
          });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @description get orders for customer
 * @param route GET /api/v1/user/profile/cart
 * @param access user
 */
 exports.getAllOrdersForCustomer = async (req, res, next) => {
    try {
      if(req.user){
      orders = await orderModel.find({
          customerId: req.user.id
      });

      ordersList = []
      for(k=0; k<orders.length; k++)
      {
      order=orders[k]

      shop = await shopModel.findById(order.shopId)
     
      products = [];
      for(i=0; i<order.products.length; i++){
        product = await productModel.findById(order.products[i].product)
        products.push({product:product, qty:order.products[i].qty});
      }
      ordersList.push({shop:shop, products: products});
      console.log(ordersList)
    }

      res.status(200).json({
        sucess: true,
        body: {customerId: orders[0].customerId, orders: ordersList},
    })
     }
    } catch (error) {
      next(error);
    }
  };

  /**
 * @description get order for shopOwner
 * @param route GET /api/v1/user/profile/cart
 * @param access user
 */
 exports.getAllOrdersFor = async (req, res, next) => {
    try {
      if(req.user){
        shop = await shopModel.find({
            user:user.id
        });
        console.log("shop: ", shop)
      orders = await orderModel.find({
          shopId: req.user.id
      });

      ordersList = []
      for(k=0; k<orders.length; k++)
      {
      order=orders[k]

      shop = await shopModel.findById(order.shopId)
     
      products = [];
      for(i=0; i<order.products.length; i++){
        product = await productModel.findById(order.products[i].product)
        products.push({product:product, qty:order.products[i].qty});
      }
      ordersList.push({shop:shop, products: products});
      console.log(ordersList)
    }

      res.status(200).json({
        sucess: true,
        body: {customerId: orders[0].customerId, orders: ordersList},
    })
     }
    } catch (error) {
      next(error);
    }
  };

  exports.getAllOrdersForShop = async (req, res, next) => {
    try {
      let shopId = req.params.shopId;
  
      console.log("id: ", shopId)
      orders = await orderModel.find({
        shopId: shopId
        });
  
    console.log("orders: ", orders)

      res.status(200).json({
        sucess: true,
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  };