const express = require("express");
const colors = require("colors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const errorHandler = require("./middleware/errorhandler.js");
const connetDB = require("./config/db.js");
const fileUpload = require("express-fileupload");
const path = require("path");
const app = express();

//config path
dotenv.config({ path: "./config/config.env" });

//routes import
const auth = require("./routes/auth.js");

const consumerRoutes = require("./routes/consumerRoutes.js");
const shop = require("./routes/shop");
const product = require("./routes/product");

app.set('view engine', 'ejs');
app.use(morgan("dev"));
app.use(fileUpload());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use("/api/v1/auth", auth);
app.use("/api/v1", consumerRoutes)
app.use("/api/v1/shop", shop);
app.use("/api/v1", product);
app.use(errorHandler);
connetDB();

const port = process.env.PORT || 8000;
const server = app.listen(
  port,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on PORT:${port}`.yellow.bold
  )
);

process.on("unhandledRejection", (err, promisee) => {
  console.log(`Error : ${err.message}`.red.bold);
  server.close(() => process.exit(1));
});
