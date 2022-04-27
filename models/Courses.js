//schema for courses
const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Please add a course title']
    },
    description: {
        type: String,
        required: [true, 'Please add a course description']
    },
    weeks: {
        type: String,
        required: [true, 'Please add a week number']
    },
    tuition: {
        type: Number,
        required: [true, 'Please add a tuition fees']
    },
    minimumSkill: {
        type: String,
        required: [true, 'Please add a minimum skill level'],
        enum: ['beginner', 'intermediate', 'advanced']
    },
    scohlershipAvailable: {
        type: Boolean,
        default: false,
        required: [true, 'Please add information about schohlership'],
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    bootcamp: {
        type: mongoose.Schema.ObjectId,
        ref: 'Bootcamp',
        required: true
    }
});

module.exports = mongoose.model('Course', CourseSchema);