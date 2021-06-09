const ErrorHandler = require("../utils/errorHandler.js");
//const userModel = require("../models/user.js");

/**
 * @description register user
 * @param route POST /api/v1/auth/register
 * @param access PRIVATE
 */
exports.registerUser = async (req, res, next) => {
  try {
    //   const { name, email, password, role } = req.body;
    //   const user = await userModel.create({
    //     name,
    //     email,
    //     password,
    //     role,
    //   });

    //   //NOTE: static are called on model so , it will called upon userModel
    //   //methods are called on the actual user data , so it will call on 'user'

    //   const token = user.getSignedJwtToken();

    let token = "some string token";

    res.status(200).json({
      sucess: true,
      token,
    });
  } catch (error) {
    next(error);
  }
};
