const express = require("express");
const router = express.Router({mergeParams:true});
const {listingSchema ,reviewSchema} = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {validateReview, isLoggedin, isReviewAuthor} = require("../middleware.js")
const wrapAsync = require("../utils/wrapAsync.js");

const reviewController = require("../controllers/reviews.js");




// Review 
//post review route

router.post("/",isLoggedin,validateReview, wrapAsync(reviewController.createReview));

//Delete review route

router.delete("/:reviewId",isLoggedin,isReviewAuthor,wrapAsync(reviewController.destroyReview));

module.exports = router;