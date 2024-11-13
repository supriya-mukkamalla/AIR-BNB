const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });


// Index Route
router.route("/")
  .get(wrapAsync(listingController.index)) 
  .post(
    isLoggedIn,
   
    upload.single('listing[image]'),
    validateListing,
    wrapAsync(listingController.createListing)
  );
  
// New Listing Form Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

router.route("/:id").get(wrapAsync(listingController.showListing))
.put(
  isLoggedIn,
  isOwner,
  upload.single("listing(image"),
  validateListing,
  wrapAsync(listingController.updateListing)
)
.delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

// Show Route for Listing (with populated reviews)
router.get("/:id", wrapAsync(listingController.showListing));

// Edit Form Route for a listing
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

// Update Route for a listing
router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  validateListing,
  wrapAsync(listingController.updateListing)
);

// Delete Route for a listing
router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.destroyListing)
);

module.exports = router;
