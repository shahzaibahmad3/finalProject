const ErrorHandler = require("../utils/errorHandler.js");
const cartModel = require("../models/cart.js");
const shopModel = require("../models/shop.js");
const productModel = require("../models/product.js");
const orderModel = require("../models/order.js");
const userModel = require("../models/user.js");
const path = require("path");
const nodemailer = require("nodemailer");
const ejs = require("ejs");


//node mailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

/**
 * @description create order
 * @param route POST /api/v1/user/profile/cart/checkout
 * @param access user
 */
exports.createOrder = async (req, res, next) => {
  try {
    if (req.user) {

      carts = await cartModel.find({
        customerId: req.user.id,
      });
      if (carts.length == 0) {
        return next(new ErrorHandler(`Empty Cart Error`, 404));
      }
      cart = carts[0];
      products = [];
      productss = [];
      flag = false;
      for (i = 0; i < cart.products.length; i++) {
        product = await productModel.findById(cart.products[i].product);
        if (product.availableQty >= cart.products[i].qty) {
          product.availableQty = product.availableQty - cart.products[i].qty;
          products.push(product);
          productss.push({
            name: product.name,
            qty: cart.products[i].qty
          });
        } else {
          flag = true;
          if (product.availableQty > 0) {
            cart.products[i].qty = product.availableQty;
            cart.amount =
              product.price * (cart.products[i].qty - product.availableQty);
          } else {
            cart.products.splice(i, 1);
            amount = product.price * cart.products[i].qty;
          }
        }
      }

      if (flag == true) {
        await cartModel.updateOne(cart);

        res.status(400).json({
          sucess: false,
          isCartUpdated: true,
          data: "Cart updated some items are no longer available",
        });
        return;
      } else {
        for (i = 0; i < products.length; i++) {
          await productModel.update(
            { _id: products[i].id },
            { availableQty: products[i].availableQty }
          );
        }

        const order = await orderModel.create({
          customerId: cart.customerId,
          shopId: cart.shopId,
          products: cart.products,
          amount: cart.amount,
        });
        if (!order) {
          return next(
            new ErrorHandler(`Error occured for creating order`, 404)
          );
        }

        await cartModel.deleteOne(cart);

        shopp = await shopModel.findById(cart.shopId);

        // sent email successfull

      let filePath = path.join(__dirname, "../views/paymentSuccessful.ejs");
      ejs.renderFile(filePath, {
        image: "https://cdn4.iconfinder.com/data/icons/eshop/403/37-512.png",
        color: "#b34d4d",
        text: "Thank You for Shopping with us.",
        amount: order.amount,
        shop: shopp.name,
        products: productss
        },  (err, data) => {
        if(err) {
          console.log("error :", err)
        }else{
          let mailOption = {
            from: process.env.EMAIL,
            to: req.user.email,
            subject: "Payment Successful",
            html: data
          };

          transporter.sendMail(mailOption, (err, data) => {
            if (err) {
              console.log("Error occured", err);
            } else {
              console.log("Email sent !", data);
            }
          });
        }
      });

        res.status(201).json({
          sucess: true,
          data: order,
        });
      }
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
    if (req.user) {
      orders = await orderModel.find({
        customerId: req.user.id,
      });

      ordersList = [];
      for (k = 0; k < orders.length; k++) {
        order = orders[k];

        shop = await shopModel.findById(order.shopId);

        products = [];
        for (i = 0; i < order.products.length; i++) {
          product = await productModel.findById(order.products[i].product);
          products.push({ product: product, qty: order.products[i].qty });
        }
        ordersList.push({ shop: shop, products: products });
        console.log(ordersList);
      }

      res.status(200).json({
        sucess: true,
        body: { customerId: orders[0].customerId, orders: ordersList },
      });
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
exports.getAllOrdersForShop = async (req, res, next) => {
  try {
    let shopId = req.params.shopId;

    if (req.user) {
      orders = await orderModel.find({
        shopId: shopId,
      });

      ordersList = [];
      for (k = 0; k < orders.length; k++) {
        order = orders[k];

        customer = await userModel.findById(order.customerId);

        products = [];
        for (i = 0; i < order.products.length; i++) {
          product = await productModel.findById(order.products[i].product);
          products.push({ product: product, qty: order.products[i].qty });
        }
        ordersList.push({
          customer: {
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            address: customer.location,
          },
          products: products,
        });
      }

      res.status(200).json({
        sucess: true,
        body: { orders: ordersList },
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.getAllOrdersForShopOwner = async (req, res, next) => {
  try {
    let shopId = req.params.shopId;

    orders = await orderModel.find({
      shopId: shopId,
    });

    res.status(200).json({
      sucess: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};
