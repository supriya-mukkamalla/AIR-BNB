if(process.env.NODE_ENV != "production") {
require('dotenv').config();
}


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// Routers
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// MongoDB Connection

const dbUrl = process.env.ATLASDB_URL;

main().then(() => console.log("Connected to DB")).catch(err => console.log(err));


async function main() {
  await mongoose.connect(dbUrl);
}


// Configure EJS and Views
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: "process.env.SECRET"
  },
  touchAfter: 24 * 3600,
})

store.on("error", () => {
  console.log("ERROR in MONGO SESSION STORE", err);
});


// Session and Flash Configuration
const sessionConfig = {
  store,
  secret: "process.env.SECRET",
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 },
};


app.use(session(sessionConfig));
app.use(flash());



// Passport Setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash Messages and Current User Middleware
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});


app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter); // For `/signup`, `/login`, `/logout`, no `/users` prefix

// Catch-all for Undefined Routes
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error", { message });
});

// Start the Server
app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});
