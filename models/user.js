const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const geocoder = require("../utils/geojsonDecoder.js");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add you name"],
  },
  email: {
    type: String,
    required: [true, "PLease add an email"],
    unique: true,
    match: [
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "please add an valid email",
    ],
  },
  address: {
    type: String,
  },
  location: {
    //GeoJson Point
    type: {
      type: String,
      enum: ["Point"],
      // required: true
    },
    coordinates: {
      type: [Number],
      require: true,
      index: "2dsphere",
    },
    formattedAddress: String,
    street: String,
    city: String,
    state: String,
    zipcode: String,
    country: String,
  },
  phone: {
    type: Number,
    required: [true, "Please add phone"],
  },
  role: {
    type: String,
    enum: ["shopowner", "consumer"],
    default: "consumer",
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 6,
    select: false,
  },
  emailVerified:{
    type: Boolean,
    default: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next(); //NOTE-> THERE IS NOT NEXT IN THE VIDEO
});

UserSchema.pre("save", async function (next) {
  const loc = await geocoder.geocode(this.address);
  this.location = {
    type: "Point",
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].state,
    zipcode: loc[0].zipcode,
    country: loc[0].country,
  };
  this.address = undefined;
  next();
});

UserSchema.methods.getSignedJwtToken = function () {
  //this cannot be accesed in statics ?? there are only available in methods ??
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

UserSchema.methods.matchpasswords = async function (enteredPassword) {
  //this cannot be accesed in statics ?? there are only available in methods ??
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.getResetToken = function () {
  //genrating token
  const resetToken = crypto.randomBytes(20).toString("hex");

  //hash the generated token
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  //10 minitues
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

module.exports = mongoose.model("User", UserSchema);
