const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    comment: {
        type: String,
        required: true, // Ensures each review has a comment
        trim: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true // Ensures each review has a rating
    },
    createdAt: {
        type: Date,
        default: Date.now // Uses Date.now as the default
    },
    author: {
        type: Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    }
});

// Export the model
module.exports = mongoose.model("Review", reviewSchema);
