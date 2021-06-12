const ErrorHandler = require("../utils/errorHandler.js");
const userModel = require("../models/user.js");
<<<<<<< HEAD
const nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");
//node mailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});
=======
const { getEmailVerificationLink } = require("../controllers/emailVerification.js");
>>>>>>> 992de3171b15e465c1943251c42da11bf4dac17a

/**
 * @description register user
 * @param route POST /api/v1/auth/register
 * @param access PUBLIC
 */
exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, address, phone, role, password, geometry } = req.body;

    // if role consumer then address is nessasary
    if (role == "consumer") {
      if (!address) {
        return next(
          new ErrorHandler(`Address is needed for role ${role}`, 403)
        );
      }
    }

    const user = await userModel.create({
      name,
      email,
      address,
      phone,
      role,
      password,
      geometry,
    });

    // //   //NOTE: static are called on model so , it will called upon userModel
    // //   //methods are called on the actual user data , so it will call on 'user'

    const token = user.getSignedJwtToken();
    const emailVerificationlink = getEmailVerificationLink(email);

    console.log(emailVerificationlink)

    if (token) {
      let mailOption = {
        from: process.env.EMAIL,
        to: email,
        subject: "Welcome Email",
        text: "You have successfully registered ! Welcome to our platform",
      };

      transporter.sendMail(mailOption, (err, data) => {
        if (err) {
          console.log("Error occured", err);
        } else {
          console.log("Email sent !", data);
        }
      });
    }

    res.status(200).json({
      sucess: true,
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @description login user
 * @param route POST /api/v1/auth/login
 * @param access PRIVATE
 */
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    //validate email and password
    if (!email || !password) {
      return next(new ErrorHandler("Please provide email password", 400));
    }

    //check for user
    const user = await userModel
      .findOne({
        email,
      })
      .select("+password");

    if (!user) {
      return next(new ErrorHandler("Invalid credentials", 400));
    }

    //check password
    const isMatch = await user.matchpasswords(password);
    if (!isMatch) {
      return next(new ErrorHandler("Invalid credentials", 400));
    }

    //NOTE: static are called on model so , it will called upon userModel
    //methods are called on the actual user data , so it will call on 'user'

    const token = user.getSignedJwtToken();

    res.status(200).json({
      sucess: true,
      token,
    });
  } catch (error) {
    next(error);
  }
};
