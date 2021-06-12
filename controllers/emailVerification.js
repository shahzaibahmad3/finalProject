const CryptoJs = require("crypto-js");
const userModel = require("../models/user.js");
const emailVerificationModel = require("../models/emailVerification.js");
const ErrorHandler = require("../utils/errorHandler.js");

const secret = "123";

const encode = (text) => {
    return CryptoJs.AES.encrypt(text, secret).toString();
}

const decode = (cipher) => {
    const bytes = CryptoJs.AES.decrypt(cipher, secret);
    return bytes.toString(CryptoJs.enc.Utf8)
}


exports.getEmailVerificationLink = (email) => {
    key = Math.floor(100000 +Math.random() * 900000 )+"";

    message = {
        email: email,
        key :key
    }

    await = emailVerificationModel.create(message);

    linkText = encode(JSON.stringify(message))
    link = "/api/v1/user/email-verification/"+linkText
    return link;
}

exports.verifyEmail = async (req, res, next) => {
    try{
        console.log(req.query.message)
        message = req.query.message.split(" ").join("+");
        console.log(message)
        decoded = JSON.parse(decode(message));
    
        console.log("decoded: ", decoded)

        user = await userModel.findOne({
            email: decoded.email
        });
    
        console.log("user: ", user)
    
        if(user.emailVerified == true){
            res.render('emailVerification', { status:"Email Alreday Verified" })
            return
        }
        emailVerification = await emailVerificationModel.findOne({
            email: decoded.email
        })

        console.log("email: ", emailVerification.key, decoded.key)
        if(emailVerification.key == decoded.key){
            user.emailVerified = true;
            await userModel.updateOne(user);
            await emailVerificationModel.deleteOne(emailVerification);
    
            res.status(200).json({
                status: "Email verified Successfully"
            })
        }else{
            console.log("NOOOOO")
            res.status(400).json({
                status: "Wrong Link"
            })
        }
        } catch (error) {
           res.status(400).json({
               status: "Error verifying email"
           })
      }
}
