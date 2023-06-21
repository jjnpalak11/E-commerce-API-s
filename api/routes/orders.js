const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Product = require("../model/product.js");
const Order = require("../model/orders.js");
const checkAuth = require("../middleware/checkAuth.js");
router.get("/", checkAuth, (req, res, next) => {
  Order.find()
    .select("product quantity _id")
    .populate("product", "name")
    .exec()
    .then((result) => {
      res.status(201).json({
        count: result.length,
        result: result.map((doc) => {
          return {
            _id: doc._id,
            product: doc.product,
            quantity: doc.quantity,
            request: {
              type: "GET",
              url: "http://localhost:3000/orders/" + doc._id,
            },
          };
        }),
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});
router.post("/", checkAuth, (req, res, next) => {
  Product.findById(req.body.product)
    .then((product) => {
      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }
      const order = new Order({
        _id: new mongoose.Types.ObjectId(),
        quantity: req.body.quantity,
        product: req.body.product,
      });
      return order.save();
    })
    .then((result) => {
      console.log(result),
        res.status(201).json({
          message: "Order was stored",
          result: result,
          request: {
            type: "POST",
            url: "http://localhost:3000/orders/" + result._id,
          },
        });
    })
    .catch((err) => {
      res.status(500).json({
        message: "Product not found",
        error: err,
      });
    });
});
router.get("/:orderId", checkAuth, (req, res, next) => {
  Order.findById(req.params.orderId)
    .select("_id product quantity")
    .populate("product", "name price")
    .exec()
    .then((result) => {
      if (!result) {
        return res.status(404).json({
          message: "Order was not found",
        });
      }
      res.status(201).json({
        result: result,
        request: {
          type: "GET",
          url: "http://localhost:3000/orders/" + result._id,
        },
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});
router.delete("/:orderId", checkAuth, (req, res, next) => {
  Order.deleteOne({ _id: req.params.orderId })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "deleted the order",
        request: {
          type: "POST",
          url: "http://localhost:3000/orders/",
        },
        body: {
          product: "string",
          quantity: "number",
        },
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

module.exports = router;
