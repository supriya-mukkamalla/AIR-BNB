const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");  
const { validateReview, isLoggedIn } = require("../middleware.js"); // Corrected 'requre' to 'require'

// Post Route for adding a new review to a listing
router.post("/", 
    isLoggedIn,
    validateReview, 
    wrapAsync(async (req, res) => {
        console.log(req.params.id);
        let listing = await Listing.findById(req.params.id);
        let newReview = new Review(req.body.review);
        newReview.author = req.user._id;
        console.log(newReview);
        listing.reviews.push(newReview); // Corrected here
        await newReview.save();
        await listing.save();
        req.flash("success", "New Review Created!");
        console.log("New review saved");
        res.redirect(`/listings/${listing._id}`);
    })
);

// Delete review route
router.delete("/:reviewId", wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;

    // Remove the review reference from the listing's reviews array
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

    // Delete the actual review document
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted!");

    res.redirect(`/listings/${id}`);
}));

module.exports = router;
