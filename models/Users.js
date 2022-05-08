const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const UserSchema = mongoose.Schema({
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
});
//hasahing the password
UserSchema.pre('save', async function (next) {
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

module.exports = mongoose.model('User', UserSchema);