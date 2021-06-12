const CryptoJs = require("crypto-js");
const userModel = require("../models/user.js");
const emailVerificationModel = require("../models/emailVerification.js");
const ErrorHandler = require("../utils/errorHandler.js");

const secret = "123";

success = {
  image:
    "https://cdn1.iconfinder.com/data/icons/emails-6/32/email_mail_verify_verified_inbox_true_right-512.png",
  color: "#00cc7a",
};

failure = {
  image: "https://cdn0.iconfinder.com/data/icons/shift-free/32/Error-512.png",
  color: "#ff3333",
};

const encode = (text) => {
  return CryptoJs.AES.encrypt(text, secret).toString();
};

const decode = (cipher) => {
  const bytes = CryptoJs.AES.decrypt(cipher, secret);
  return bytes.toString(CryptoJs.enc.Utf8);
};

exports.getEmailVerificationLink = (email) => {
  key = Math.floor(100000 + Math.random() * 900000) + "";

  message = {
    email: email,
    key: key,
  };
  
  emailVerificationModel.deleteMany({email: email}).then(() => {
      console.log("Deleted")
    }).catch((error) => {
      console.log("Error: ", error)
    })

  emailVerificationModel.create(message);

  linkText = encode(JSON.stringify(message));
  link = "/api/v1/user/email-verification?message=" + linkText;
  return link;
};

exports.verifyEmail = async (req, res, next) => {
  try {
    message = req.query.message.split(" ").join("+");
    decoded = JSON.parse(decode(message));

    console.log(decoded)

    user = await userModel.findOne({
      email: decoded.email,
    });

    if (user.emailVerified == true) {
      res.render("emailVerification", {
        image: success.image,
        color: success.color,
        status: "Email Alreday Verified",
        text: "Thank You",
        verificationLink: ""      
      });
      return;
    }

    emailVerification = await emailVerificationModel.findOne({
      email: decoded.email,
    });

    console.log("key ", emailVerification)

    if (emailVerification.key == decoded.key) {
      user.emailVerified = true;
      await userModel.update({_id:user.id}, {emailVerified: true})
      await emailVerificationModel.deleteOne(emailVerification);

      res.render("emailVerification", {
        image: success.image,
        color: success.color,
        status: "Email successfully verified",
        text: "Thank You",
        verificationLink: ""
      });
      return;
    } else {
      res.render("emailVerification", {
        image: failure.image,
        color: failure.color,
        status: "Wrong Link",
        text: "Thank You",
        verificationLink: ""
      });
    }
  } catch (error) {
      console.log(error)
    res.render("emailVerification", {
      image: failure.image,
      color: failure.color,
      status: "Error Verifying email",
      text: "Thank You",
      verificationLink: ""
    });
  }
};
