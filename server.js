const express = require('express');
//setting env vars with custom path
require('dotenv').config({
    path: './config/config.env'
})

const app = express();
const PORT = process.env.PORT || 5000

app.listen(PORT, ()=> console.log(`listening at ${PORT}`));