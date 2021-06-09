const express = require("express");
const colors = require("colors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const errorHandler = require("./middleware/errorhandler.js");
const app = express();

//config path
dotenv.config({ path: "./config/config.env" });

//routes import
const auth = require("./routes/auth.js");

app.use(morgan("dev"));
app.use(express.json());
app.use("/api/v1/auth", auth);
app.use(errorHandler);

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
