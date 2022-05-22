const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 10
    },
    user: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'Users'
    },
    bootcamp: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'Bootcamp'
    },
    createdOn: {
        type: Date,
        default: Date.now(),
        required: true
    },
    updatedOn: {
        type: Date,
        default: Date.now(),
        required: true
    }
});

ReviewSchema.statics.getAvgRating = async function (bootcampId) {
    const obj = await this.aggregate([
        {
            $match: {
                bootcamp: bootcampId
            }
        },
        {
            $group: {
                _id: '$bootcamp',
                averageRating: {
                    $avg: '$rating'
                }
            }
        }
    ]);
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
        averageRating: Math.floor(obj[0].averageRating),
    });
};
ReviewSchema.post('save', async function () {
    await this.constructor.getAvgRating(this.bootcamp);
});
ReviewSchema.pre('remove', async function () {
    await this.constructor.getAvgRating(this.bootcamp);
});
module.exports = mongoose.model('Review', ReviewSchema);