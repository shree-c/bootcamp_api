//seperate script to import and delete data
//use option -d for deleting and -c for adding data
const fs = require('fs');
const mongoose = require('mongoose');
const Bootcamp = require('./models/Bootcamps');
const Course = require('./models/Courses');
const Users = require('./models/Users');
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
const add_users = async () => {
    try {
        await Users.create(JSON.parse(fs.readFileSync(`${__dirname}/_data/users.json`)));
        console.log(`added all users`.green.inverse);
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

const delete_users = async () => {
    try {
        await Users.deleteMany();
        console.log(`deleted all users`.red);
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

const arg_str = process.argv.slice(2);
if (!arg_str.length) {
    console.log('no options provided');
}
console.log(arg_str);
arg_str.forEach(async (val, ind) => {
    console.log(`option ${ind + 1} : ${val}:`.yellow);
    switch (val) {
        case '-db':
            await connectDB().then(() => {
                delete_bootcamps();
            });
            break;
        case '-cb':
            connectDB().then(() => {
                add_bootcamps();
            });
            break;
        case '-cc':
            await connectDB().then(() => {
                add_courses();
            });
            break;
        case '-dc':
            await connectDB().then(() => {
                delete_courses();
            });
            break;
        case '-cu':
            await connectDB().then(() => {
                add_users();
            });
            break;
        case '-du':
            await connectDB().then(() => {
                delete_users();
            });
            break;
        default:
            console.log('unknown operation'.red.underline);
            break;
    }
});
