//seperate script to import and delete data
//use option -d for deleting and -c for adding data
const fs = require('fs')
const mongoose = require('mongoose')
const Bootcamp = require('./models/Bootcamps')
require('colors')
require('dotenv').config({
    path: './config/config.env'
})

const connectDB = async () => {
    const conn = await mongoose.connect(process.env.MONGO_U);
    console.log(`connected to db ${conn.connection.host}`.green)
}

const delete_data = async () => {
    try {
        await Bootcamp.deleteMany();
        console.log(`deleted all bootcamps`.red)
        process.exit(0);
    } catch (error) {
        console.log(error)
        process.exit(1);
    }
}

const add_data = async () => {
    try {
        await Bootcamp.create(JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`)))
        console.log(`added all bootcamps`.green.inverse)
        process.exit(0);
    } catch (error) {
        console.log(error)
        process.exit(1);
    }
}
const arg_str = process.argv.slice(2)[0];
if (arg_str === '-d') {
    connectDB().then(() => {
        delete_data();
    })
} else if (arg_str === '-c') {
    connectDB().then(() => {
        add_data();
    })
} else {
    console.log('unknown operation: use -c to add and -d to delete'.red.underline)
}
