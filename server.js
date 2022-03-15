const express = require('express');
const router = require('./routes/router')
const app = express();
//for coloring text
require('colors')
//connection to db
require('./config/db')();
//json middleware
app.use(express.json());
//logger middleware
const morgan = require('morgan')
//setting env variables
require('dotenv').config({
    path: './config/config.env'
})
//mounting router a some root
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}
app.use('/api/v1/bootcamps/', router)
const PORT = process.env.PORT || 5000

const server = app.listen(PORT, () => console.log(`listening at ${PORT} env: ${process.env.NODE_ENV}`.yellow.italic.underline));

process.on('unhandledRejection', (err) => {
    console.log(`${err.message}`.red);
    server.close(() => process.exit(1))
})