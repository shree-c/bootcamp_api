const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const UserSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please enter name']
        },
        email: {
            type: String,
            required: [true, 'Please enter email'],
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please add a valid email'
            ],
            unique: true,
            index: true
        },
        password: {
            type: String,
            required: [true, 'Please enter password'],
            minlength: 6,
            select: false //will not return on query
        },
        role: {
            type: String,
            enum: ['user', 'publisher'],
            default: 'user'
        },
        resetPasswordToken: String,
        resetPasswordExpire: Date,
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

UserSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'bootcamp',
    justOne: false,
});
//hashing the password
UserSchema.pre('save', async function (next) {
    //run only if password is modified
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

//json webtokens usage
UserSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

//method on user for password comparision
UserSchema.methods.compare = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

//method for generating password reset token
UserSchema.methods.getResetPasswordToken = function () {
    //generating the token
    //1. generating random bytes
    const resetToken = crypto.randomBytes(20).toString('hex');
    //2. hash token and set to resetPasswordToken in db
    //this is just setting up on the object not the actual db
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    // set expire field in db
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    //return unhashed version
    return resetToken;
};
module.exports = mongoose.model('User', UserSchema);
