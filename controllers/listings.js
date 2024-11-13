const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
  try {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  } catch (err) {
    console.error(err);
    req.flash("error", "Could not load listings.");
    res.redirect("/");
  }
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  try {
    const listing = await Listing.findById(id)
      .populate({
        path: "reviews",
        populate: {
          path: "author", // This populates the 'author' field inside the reviews
        },
      })
      .populate("owner"); // Populating the 'owner' of the listing

    if (!listing) {
      req.flash("error", "Listing you requested does not exist!");
      return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong while fetching the listing.");
    res.redirect("/listings");
  }
};

module.exports.createListing = async (req, res) => {
  try {
    const url = req.file.path;
    const filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    
    // Corrected line: Use `req.user._id` to assign the owner
    newListing.owner = req.user._id;
    
    // Set the image with `url` and `filename`
    newListing.image = { url, filename };

    // Save the new listing
    await newListing.save();
    
    // Success message
    req.flash("success", "Listing created successfully!");
    res.redirect("/listings");
  } catch (error) {
    console.error("Error creating listing:", error);
    req.flash("error", "Something went wrong while creating the listing.");
    res.redirect("/listings");
  }
};


module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  try {
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing you requested does not exist!");
      return res.redirect("/listings");
    }

    if (!listing.owner.equals(req.user._id)) {
      req.flash("error", "You don't have permission to edit this listing.");
      return res.redirect(`/listings/${id}`);
    }

    // Prepare the original image URL with transformations
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");

    // Render the edit form and pass necessary data
    res.render("listings/edit", { listing, originalImageUrl });
  } catch (error) {
    req.flash("error", "Something went wrong. Please try again.");
    return res.redirect("/listings");
  }
};


module.exports.updateListing = async (req, res) => {
  const { id } = req.params;

  try {
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

if(typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
}



    req.flash("success", "Listing updated!");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong while updating the listing.");
    res.redirect(`/listings/${id}/edit`);
  }
};

module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  try {
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing not found.");
      return res.redirect("/listings");
    }

    if (!listing.owner.equals(req.user._id)) {
      req.flash("error", "You don't have permission to delete this listing.");
      return res.redirect(`/listings/${id}`);
    }

    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted!");
    res.redirect("/listings");
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong while deleting the listing.");
    res.redirect(`/listings/${id}`);
  }
};
