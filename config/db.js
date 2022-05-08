const mongoose = require('mongoose');
require('dotenv').config({
    path: './config/config.env'
});
let conn;
const connectDB = async function () {
    conn = await mongoose.connect(process.env.MONGO_U, {
        autoIndex: true
    });
    console.log(`connected to db ${conn.connection.host}`.green);
};
exports.connection = conn;
exports.connect_db = connectDB;