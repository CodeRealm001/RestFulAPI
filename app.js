const express = require('express');

const app = express();
const morgan = require('morgan');
const bodyParse = require('body-parser');
const mongoose = require('mongoose');


const productRoutes = require('./api/routes/products');
const ordersRoutes = require('./api/routes/orders');
const userRoutes = require('./api/routes/users');


const process = require('./nodemon.json');

//Middleware
/* app.use((req, res, next) => {

    res.status(200).json({

        message: 'It Works'
    });

}); */

///Database Connection opening connection
mongoose.connect('mongodb+srv://Temmy:' + process.env.MONGO_ATLAS_PW + '@cluster0-nivcj.mongodb.net/test?retryWrites=true');
mongoose.Promise = global.Promise;

///+process.env.MONGO_ATLAS_PW+ temitope02



app.use('/uploads', express.static('uploads'));
app.use(morgan('dev'));

// When ever data are passed, make it readable in real data
app.use(bodyParse.urlencoded({ extended: false }));
app.use(bodyParse.json());


///Creating the Router

app.use('/product', productRoutes);
app.use('/orders', ordersRoutes);
app.use('/users', userRoutes);

//CORS ERROR handling
//// It ensures to prevent cors error
app.use((req, res, next) => {

    res.header('Acess-Control-All-Origin', '*');
    res.header('Acess-Control-All-Header', "Origin, X-Requested-With, Content, Accept, Authorization");

    /// Check if incoming request
    if (req.method === 'OPTIONS') {
        res.header('Acess-Control-Allow-Methods', 'PUT,POST,PATCH,DELETE');
        return res.status(200).json({});
    }
    ///////////////
    next(error);
});

//Error Handling 
app.use((req, res, next) => {

    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {

    res.status(err.status || 500);

    res.json({
        error: {
            message: error.message
        }
    });
});
module.exports = app;