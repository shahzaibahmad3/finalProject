const mongoose = require("mongoose");

const EmailVerificationSchema = new mongoose.Schema({
  email: {
    type: String,
    require: true
  },
  key: {
      type: String,
      require: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


module.exports = mongoose.model("EmailVerification", EmailVerificationSchema);
