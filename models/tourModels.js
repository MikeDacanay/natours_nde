const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,
        maxlength: [40, 'A tour name must have lte then 40 chars'],
        minlength: [10, 'A tour name must be gte then 10'],
        // validator: [validator.isAlpha, 'Tour name must only contain charactrers'],
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficult is eather: easy, medium, difficult',
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1'],
        max: [5, 'Rating must be below 5']        
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function(val){
                //this wont work on update
                return val < this.price;
            },
            message: 'Discount price ({VALUE}) shoudl be below reg rpice',
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'a true must have a summary']
    },
    description: {
        type: String,
        trim: true,
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

tourSchema.virtual('durationWeeks').get(function(){
    return this.duration / 7;
});

// DOCUMENT MIDDLEWARE: run before .save() and .create()
tourSchema.pre('save', function(next){
    this.slug = slugify(this.name, {lower: true});
    next();
});
    //save doesnt workign findOne andupdate

// QUERY MIDDLEWARE
tourSchema.pre( /^find/, function(next) {
    this.find({ secretTour: { $ne: true }})
    
    this.start = Date.now();
    next();
});

tourSchema.post(/^find/, function(docs, next) {
    // console.log(`Query Took ${Date.now() - this.start} milliseconds`);
    // console.log(docs);
    next();
})

// AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function(next){
    this.pipeline().unshift({ $match: { secretTour: { $ne: true}}})

    console.log(this.pipeline());
    next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

