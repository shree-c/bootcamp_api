//seperate script to import and delete data
//use option -d for deleting and -c for adding data
const fs = require('fs');
const mongoose = require('mongoose');
const Bootcamp = require('./models/Bootcamps');
const Course = require('./models/Courses');
require('colors');
require('dotenv').config({
    path: './config/config.env'
});

const connectDB = async () => {
    const conn = await mongoose.connect(process.env.MONGO_U);
    console.log(`connected to db ${conn.connection.host}`.green);
};

const delete_bootcamps = async () => {
    try {
        await Bootcamp.deleteMany();
        console.log(`deleted all bootcamps`.red);
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

const add_bootcamps = async () => {
    try {
        await Bootcamp.create(JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`)));
        console.log(`added all bootcamps`.green.inverse);
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

const add_courses = async () => {
    try {
        await Course.create(JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`)));
        console.log(`added all courses`.green.inverse);
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

const delete_courses = async () => {
    try {
        await Course.deleteMany();
        console.log(`deleted all courses`.red);
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

const arg_str = process.argv.slice(2)[0];
if (arg_str === '-db') {
    connectDB().then(() => {
        delete_bootcamps();
    });
} else if (arg_str === '-cb') {
    connectDB().then(() => {
        add_bootcamps();
    });
} else if (arg_str === '-cc') {
    connectDB().then(() => {
        add_courses();
    });
} else if (arg_str === '-dc') {
    connectDB().then(() => {
        delete_courses();
    });
} else {
    console.log('unknown operation'.red.underline);
};
