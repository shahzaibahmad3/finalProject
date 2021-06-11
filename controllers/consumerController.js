const ErrorHandler = require("../utils/errorHandler.js");
const userModel = require("../models/user.js");

/**
 * @description register user
 * @param route POST /api/v1/user/profile
 * @param access user
 */
exports.getUser = (req, res, next) => {
  try {
    if(req.user){
    res.status(200).json({
        sucess: true,
        body: req.user,
      });
    }else{
        res.status(404).json({
            sucess: false,
            body: null,
        })
    }
  } catch (error) {
    next(error);
  }
};

