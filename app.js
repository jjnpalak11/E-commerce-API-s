const express = require("express");
const app = express();
const morgan = require("morgan");
const productRoutes = require("./api/routes/products");
const orderRoutes = require("./api/routes/orders");
const userRoutes = require("./api/routes/user");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, PUSH, GET, PATCH, DELETE");
  }
  next();
});
mongoose.connect(
    "mongodb+srv://jjnpalak11:"+ process.env.MONGO_ATLAS_PW  +"@cluster0.pstdyzb.mongodb.net/?retryWrites=true&w=majority"
);
mongoose.Promise = global.Promise;
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/user", userRoutes);

app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});
module.exports = app;
