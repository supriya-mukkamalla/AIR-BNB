const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

// Signup Route - GET
router.get("/signup", (req, res) => {
    res.render("users/signup"); // Ensure "views/users/signup.ejs" exists
});

// Signup Route - POST
router.post("/signup", wrapAsync(async (req, res, next) => {
    const { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    req.login(registeredUser, (err) => {
        if (err) return next(err);
        req.flash("success", "Welcome to Wanderlust!");
        res.redirect("/listings");
    });
}));

// Login Route - GET
router.get("/login", (req, res) => {
    res.render("users/login");
});

// Login Route - POST
router.post(
    "/login",
    saveRedirectUrl,
    passport.authenticate("local", {
        failureRedirect: "/login", // Redirects to login on failure
        failureFlash: true,
    }),
    (req, res) => {
        const redirectUrl = res.locals.redirectUrl || "/listings";
        req.flash("success", "Welcome back to Wanderlust!");
        
        res.redirect(redirectUrl); // Redirects to stored URL or "/listings"
    }
);

// Logout Route - GET
router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash("success", "You are logged out now!");
        res.redirect("/listings");
    });
});

module.exports = router;
