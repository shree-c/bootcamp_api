//schema for courses
const mongoose = require('mongoose');
const { average } = require('../utils/misc');

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

/*
a middeware to calculate the average cost of courses offered by a bootcamp
when a course is added to a bootcamp it's average cost has to be updated
we use post transaction hook
i have made a custom function
one can also use aggeration facility in mongodb
*/
/**
 * 
 * @param {Mongodb ObjectID} bootcampId 
 */
CourseSchema.statics.getAvgCost = async function (bootcampId) {
    const obj = await this.aggregate([
        {
            $match: {
                bootcamp: bootcampId
            }
        },
        {
            $group: {
                _id: '$bootcamp',
                averageCost: {
                    $avg: '$tuition'
                }
            }
        }
    ]);
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
        averageCost: Math.floor(obj[0].averageCost),
    });
};
CourseSchema.post('save', async function () {
    await this.constructor.getAvgCost(this.bootcamp);
});
CourseSchema.pre('remove', async function () {
    await this.constructor.getAvgCost(this.bootcamp);
});

// CourseSchema.post('save', async function (doc, next) {
//     const bootcamp = await this.model('Bootcamp').findById(doc.bootcamp).populate({
//         path: 'courses',
//         select: 'tuition'
//     });
//     await this.model('Bootcamp').findByIdAndUpdate(doc.bootcamp, {
//         averageCost: average('tuition', bootcamp.courses) || null
//     });
//     next();
// });
// CourseSchema.post('remove', async function (doc, next) {
//     this.model('Bootcamp').findByIdAndUpdate(doc.bootcamp).populate({
//         path: 'courses',
//         select: 'tuition'
//     });
//     await this.model('Bootcamp').findByIdAndUpdate(doc.bootcamp, {
//         averageCost: average('tuition', bootcamp.courses) || null
//     });
//     next();
// });
module.exports = mongoose.model('Course', CourseSchema);