const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const mongoose = require("mongoose");
const {isLoggedin, isOwner,validateListing} = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer  = require('multer');
const{storage} = require("../cloudConfig.js");
const upload = multer({ storage});



router.route("/")
.get(wrapAsync(listingController.index))
.post(
    isLoggedin,
     validateListing,
    upload.single("listing[image]"),
    wrapAsync(listingController.createListings)
);

// router.route("/")
// .get(wrapAsync (listingController.index))
// // .post(isLoggedin,validateListing, wrapAsync (listingController.createListings))
// .post(upload.single("listing[image]"),(req,res)=>{
//     res.send(req.file);
// });

// new route
router.get("/new",isLoggedin,(listingController.renderNewForm));

router.route("/:id")
.put(isLoggedin,isOwner, upload.single("listing[image]"),validateListing,wrapAsync (listingController.updateListing))
.get(wrapAsync(listingController.showListings))
.delete(isLoggedin,isOwner,wrapAsync (listingController.destroyListing));




//Edit route
router.get("/:id/edit",isLoggedin,isOwner,wrapAsync (listingController.renderEditForm));








module.exports = router;