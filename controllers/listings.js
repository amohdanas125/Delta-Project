const mongoose = require("mongoose");
const Listing = require("../models/listing");
const axios = require("axios");

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {

    res.render("./listings/new.ejs");
};

module.exports.showListings = async (req, res) => {
    let { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        req.flash("error", "Invalid Listing ID!");
        return res.redirect("/listings");
    }

    const listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author" }, }).populate("owner");
    if (!listing) {
        req.flash("error", "Listing does not exist!");
        return res.redirect("/listings");
    };
    res.render("./listings/show.ejs", { listing });
};


// module.exports.createListings = async (req,res,next) => {

//     let url = req.file.path;
//     let filename = req.file.filename;

//     const newListing = Listing(req.body.listing);


//     newListing.owner = req.user._id;
//     newListing.image = {url , filename};
//     await newListing.save();
//     req.flash("success","New listing created!");
//     res.redirect("/listings");

// };

module.exports.createListings = async (req, res, next) => {

    // let url = req.file.path;
    // let filename = req.file.filename;
    let url, filename;

    if (req.file) {
        url = req.file.path;
        filename = req.file.filename;
    } else {
        url = "https://via.placeholder.com/600x400";
        filename = "default";
    }
    const newListing = new Listing(req.body.listing);

    // 🔥 STEP 1: Forward Geocoding
    const response = await axios.get("https://api.locationiq.com/v1/search.php", {
        params: {
            key: process.env.MAP_TOKEN,
            q: req.body.listing.location,
            format: "json"
        }
    });

    if (!response.data.length) {
        req.flash("error", "Invalid location");
        return res.redirect("/listings/new");
    }

    const data = response.data[0];

    // 🔥 STEP 2: Save coordinates
    newListing.geometry = {
        type: "Point",
        coordinates: [data.lon, data.lat] // ⚠️ longitude first
    };

    newListing.owner = req.user._id;
    newListing.image = { url, filename };

    await newListing.save();

    req.flash("success", "New listing created!");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing does not exist!");
        return res.redirect("/listings");
    };

    // let originalImageUrl = listing.image.url;
    // originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");
    let originalImageUrl = "";

    if (listing.image && listing.image.url) {
        originalImageUrl = listing.image.url.replace("/upload", "/upload/h_300,w_250");
    } else if (typeof listing.image === "string") {
        originalImageUrl = listing.image;
    } else {
        originalImageUrl = "https://via.placeholder.com/300x200";
    }
    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

// module.exports.updateListing = async (req, res) => {
//     let { id } = req.params;
//     let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
//     if(typeof req.file !== "undefined"){
//         let url = req.file.path;
//         let filename = req.file.filename;
//         listing.image = {url,filename};
//         await listing.save();
//     }
//     req.flash("success","Listing updated!");
//     res.redirect(`/listings/${id}`);
// };

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;

    // 🔥 STEP 1: Forward Geocoding
    const response = await axios.get("https://api.locationiq.com/v1/search.php", {
        params: {
            key: process.env.MAP_TOKEN,
            q: req.body.listing.location,
            format: "json"
        }
    });

    if (!response.data.length) {
        req.flash("error", "Invalid location");
        return res.redirect(`/listings/${id}/edit`);
    }

    const data = response.data[0];

    // 🔥 STEP 2: Add geometry into update
    req.body.listing.geometry = {
        type: "Point",
        coordinates: [data.lon, data.lat]
    };

    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    // image update (your existing logic)
    if (req.file) {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }

    req.flash("success", "Listing updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing deleted!");
    res.redirect(`/listings`);
};