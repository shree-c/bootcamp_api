const express = require('express');
const router = require('./routes/router')
const app = express();
//setting env variables
require('dotenv').config({
    path: './config/config.env'
})
//mounting router a some root
app.use('/api/v1/bootcamps/', router)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`listening at ${PORT} env: ${process.env.NODE_ENV}`));