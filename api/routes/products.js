const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const Product = require('../Models/product');
const checkAuth = require('../middleware/chek-auth');


/// How Files are stored 
//const upload = multer({ dest: 'uploads/' });


const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function(req, file, cb) {

        /* ///Just like each chinese production, multer is not fully able to work with Windows directories xD "new Date().toISOString().replace(/:/g, '-')" can helps windows users  new Date().toISOString() */
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
    }
});

//const upload = multer({ storage: storage });

/// to filter file size
const fileFilter = (req, file, cb) => {
    //reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false); //ignore the  file not save the file
        //cb(new Error('message'), false); //// Add Error Message on here
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});


//////




router.get('/', (req, res, next) => {

    /*  res.status(200).json({
        message: 'Handling GET request to product'
    });
 */

    Product.find()
        .select('name price _id productImage')
        .exec()
        .then(docs => {
            //console.log(docs);
            const response = {
                count: docs.length,
                product: docs.map(docs => {
                    return {
                        name: docs.name,
                        price: docs.price,
                        _id: docs._id,
                        productImage: docs.productImage,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/product/' + docs._id,
                        }
                    };
                })
            };
            res.status(200).json(docs);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });

});


router.post('/', checkAuth, upload.single('productImage'), (req, res, next) => {
    //First approach of adding an image is to build additional end point where you accept a binary data only
    //console.log(req.file);

    ///Using the Body Parse 
    /* const product = {
        name: req.body.name,
        price: req.body.price
    }; */


    ///Start DB
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    });
    product
        .save()
        .then(result => {
            console.log(result);

            ///Sucess Call back
            res.status(201).json({
                message: 'Handling POST request to product',
                createdProduct: {
                    name: result.name,
                    price: result.price,
                    _id: result._id,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/product/' + result._id
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
    ////END DB



});


router.get('/:productId', (req, res, next) => {

    const id = req.params.productId;
    /* 
        if (id === 'speacial') {
            res.status(200).json({
                message: 'You discovered the special ID',
                id: id
            });
        } else {

            res.status(200).json({
                message: 'You passed an ID'
            });
        }  */

    Product.findById(id)
        .select('name price _id productImage')
        .exec()
        .then(doc => {
            console.log("From Database", doc);
            if (doc) {
                res.status(200).json({
                    product: doc,
                    request: {
                        type: 'GET',
                        description: 'GET_ ALL PRODUCTS',
                        url: 'http://localhost:3000/product/'
                    }
                });
            } else {
                res.status(404).json({
                    message: "No valid Entry found for the ID"
                });
            }

        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });

});


router.patch('/:productId', checkAuth, (req, res, next) => {

    //const id = req.params.productId;


    /*  res.status(200).json({
         message: 'Updated Product'
     }); */
    const id = req.params.productId;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    Product.update({ _id: id }, { $set: updateOps })
        .exec()
        .then(result => {
            //console.log(result);
            res.status(200).json({
                message: 'product Updated',
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/product/' + id
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


router.delete("/:productId", checkAuth, (req, res, next) => {

    ///const id = req.params.productId;
    /* 
        res.status(200).json({
            message: 'Deleted Product'
        });
     */
    const id = req.params.productId;

    Product.remove({ _id: id })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Product deleted',
                request: {
                    type: 'POST',
                    url: 'http://localhost:3000/product/',
                    body: {
                        name: 'String',
                        price: 'Number'
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

module.exports = router;