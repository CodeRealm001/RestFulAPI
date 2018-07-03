const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../middleware/chek-auth');
const Order = require('../Models/order');
const ordersController = require('../controllers/orders');
const Product = require('../Models/product');






router.get('/', checkAuth, ordersController.orders_get_all);
router.get('/:orderId', checkAuth, ordersController.orders_By_Id);


router.post('/', checkAuth, ordersController.orders_Create);


router.delete('/:orderId', checkAuth, ordersController.order_Delete);


module.exports = router;