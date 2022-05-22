const express = require('express');
const path = require('path');
const bootcamps_router = require('./routes/bootcamps_router');
const courses_router = require('./routes/courses_router');
const auth_router = require('./routes/auth');
const users_router = require('./routes/users');
const reviews_router = require('./routes/review_router');
//birnging in db
const { connect_db, connection } = require('./config/db');
//express file upload for uploading files
const expressfileupload = require('express-fileupload');
//requiring custom error handler
const errorHandler = require('./middlewares/errorHandler');
const app = express();
//for coloring text
require('colors');
//json middleware
app.use(express.json());
//logger middleware
const morgan = require('morgan');
//cookie parser middleware
const cookieParser = require('cookie-parser');
//setting env variables
require('dotenv').config({
    path: './config/config.env'
});
//mounting router a some root
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
//exposing static files
app.use(express.static(path.join(__dirname, 'public')));
//file upload middleware
app.use(expressfileupload());
//cookie parser
app.use(cookieParser());
//mounting router to app
app.use('/api/v1/bootcamps/', bootcamps_router);
app.use('/api/v1/courses/', courses_router);
app.use('/api/v1/auth/', auth_router);
app.use('/api/v1/users/', users_router);
app.use('/api/v1/reviews/', reviews_router);
//error handler middleware should be used after router
//this is universal error handler
app.use(errorHandler);
const PORT = process.env.PORT || 5000;
(async function () {
    await connect_db();
    const server = app.listen(PORT, () => console.log(`listening at ${PORT} env: ${process.env.NODE_ENV}`.yellow.italic.underline));

    process.on('unhandledRejection', async (err) => {
        console.log(`${err.message}`.red);
        server.close(() => {
            console.log('server closed');
            process.exit(1);
        });
        await connection.close();
    });
})();

process.on('SIGTERM', () => {
    connection.disconnect();
    server.close(() => {
        console.log('server closed');
        process.exit(1);
    });
});
