const Order = require('../Models/order');
const mongoose = require('mongoose');


exports.orders_get_all = ((req, res, next) => {

    /*  res.status(200).json({

         message: 'Orders were Fetched'
     }); */

    Order.find()
        .select('product quantity _id')
        .populate('product', 'name')
        .exec()
        .then(doc => {
            //res.status(200).json(doc);
            res.status(200).json({
                count: doc.length,
                orders: doc.map(value => {
                    return {
                        _id: value._id,
                        product: value.product,
                        quantity: value.quantity,
                        request: {
                            type: 'GET',
                            url: 'localhost:3000/orders/' + value._id
                        }

                    };
                }),

            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });

});


exports.orders_By_Id = ((req, res, next) => {
    Order.findById(req.params.orderId)
        .populate('product') //// Very useful 
        .exec()
        .then(order => {
            if (!order) {
                return res.status(404).json({
                    message: 'Order not found'
                });

            }
            res.status(200).json({
                order: order,
                request: {
                    type: 'GET',
                    url: 'localhost:3000/orders/'
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });

});


exports.order_Delete = ((req, res, next) => {

    Order.remove({
            _id: req.params.orderId
        })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Orders deleted',
                request: {
                    type: 'POST',
                    url: 'localhost:3000/orders/',
                    body: {
                        productId: "ID",
                        quantity: "Number"
                    }
                }
            });
        })
        .catch();


    /* res.status(200).json({

        message: 'Orders deleted',
        orderId: req.params.orderId

    }); */

});


exports.orders_Create = ((req, res, next) => {

    /* const order = {
        productId: req.body.productId,
        quantity: req.body.quantity
    }; */
    // to avoid creating order for product that are not available
    Product.findById(req.body.productId)
        // Check if the product exist
        .then(product => {

            // constr
            if (!product) {
                return res.status(404).json({
                    message: " Product Not Found"
                });
            }
            const order = new Order({
                _id: mongoose.Types.ObjectId(),
                product: req.body.productId,
                quantity: req.body.quantity

            });
            // then save it 
            return order.save();
        })
        // If order does not exist then create a new order
        .then(result => {
            console.log(result);
            //res.status(201).json(result);
            res.status(201).json({
                message: "Order stored",
                createdOrders: {
                    _id: result._id,
                    product: result.product,
                    quantity: result.quantity
                },

                request: 'GET',
                url: 'localhost:3000/orders/' + result._id

            });
        })


    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });


});