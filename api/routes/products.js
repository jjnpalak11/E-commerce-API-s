const express = require("express");
const router = express.Router();
const Product = require("../model/product");
const mongoose = require("mongoose");
const checkAuth = require("../middleware/checkAuth");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});
router.get("/", (req, res, next) => {
  Product.find()
    .select("name price _id productImage description category availability")
    .exec()
    .then((doc) => {
      const response = {
        count: doc.length,
        products: doc.map((docs) => {
          return {
            name: docs.name,
            price: docs.price,
            _id: docs._id,
            productImage: docs.productImage,
            description: docs.description,
            availability: docs.availability,
            category: docs.category,
            request: {
              type: "GET",
              url: "http://localhost:3000/products/" + docs._id,
            },
          };
        }),
      };
      if (doc.length >= 0) {
        res.status(200).json(response);
      } else {
        res.status(404).json({
          message: "No existing data",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});
router.post("/", checkAuth, upload.single("productImage"), (req, res, next) => {
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    productImage: req.file.path,
    description: req.body.description,
    category: req.body.category,
    availability: req.body.availability
  });
  product
    .save()
    .then((result) => {
      console.log(result);
      res.status(200).json({
        message: "Handling POST requests to products",
        product: {
          name: result.name,
          price: result.price,
          _id: result._id,
          description: result.description,
          category: result.category,
          availability: result.availability,
          request: {
            type: "POST",
            url: "http://localhost:3000/products/" + result._id,
          },
        },
      });
    })
    .catch((err) => console.log(err));
});
router.get("/:productId", checkAuth, (req, res, next) => {
  const id = req.params.productId;
  Product.findById(id)
    .select("name price _id productImage")
    .exec()
    .then((doc) => {
      console.log(doc);
      if (doc) {
        res.status(200).json({
          product: {
            name: doc.name,
            price: doc.price,
            _id: doc._id,
            description: doc.description,
          category: doc.category,
          availability: doc.availability,
            productImage: doc.productImage,
          },
          request: {
            type: "GET",
            url: "http://localhost:3000/products/" + doc._id,
          },
        });
      } else {
        res.status(404).json({ message: "No data exists for the given id" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});
router.patch("/:productId", checkAuth, (req, res, next) => {
  const id = req.params.productId;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  Product.updateOne({ _id: id }, { $set: req.body })
    .exec()
    .then((result) => {
      console.log(result);
      res.status(200).json({
        message: "Product is updated",
        request: {
          type: "GET",
          url: "http://localhost:3000/products/" + id,
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});
router.delete("/:productId", checkAuth, (req, res, next) => {
  const id = req.params.productId;
  Product.deleteOne({ _id: id })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "the data is deleted",
        url: "http://localhost:3000/products/",
        request: {
          type: "POST",
          body: {
            name: "string",
            price: "number",
          },
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

module.exports = router;
