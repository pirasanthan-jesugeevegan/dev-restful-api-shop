const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const multer = require('multer');

const checkAuth = require('../auth/check-auth')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');//path for image file
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname) //save image as orginal name
    }
})

const fileFilter = (req, file, cb) => {
    //reject image file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

const upload = multer({ storage: storage, fileFilter: fileFilter });

const Product = require('../models/product');

router.get('/', (req, res, next) => {
    Product.find()
        .select('name price _id productImage') //only show these propertys
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                products: docs.map(doc => {
                    return {
                        _id: doc._id,
                        name: doc.name,
                        price: doc.price,
                        productImage: doc.productImage,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/products/' + doc._id
                        }
                    }
                })
            };
            res.status(200).json(response);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.post("/", checkAuth, upload.single('productImage'), (req, res, next) => {
    // id will be an object with the propertys
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    });
    product
        .save() //save is a method provided by mongoos 
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: "Created product successfuly",
                createdProduct: { // Only uses these property to create 
                    _id: result._id,
                    name: result.name,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/products/' + result._id
                    }
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});


router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
        .select('name price _id productImage') //only show these propertys
        .exec()
        .then(doc => {
            console.log("From database", doc);
            if (doc) {
                res.status(200).json({
                    product: doc, // wrap it in a product object
                });

            } else {
                res
                    .status(404)
                    .json({ message: "No valid entry found for provided ID" });
            }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({ error: err });
        });
});

router.patch('/:productId', (req, res, next) => {
    const id = req.params.productId; //passing identifer
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    Product.update({ _id: id }, { $set: updateOps }) //using ID to update
        .exec()
        .then(result => {
            res.status(200).json({
                result,
                message: 'Product updated'
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.delete('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.remove({ _id: id }) // using id 
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Product deleted'
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

module.exports = router;