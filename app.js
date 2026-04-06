require("dotenv").config();


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const flash = require('connect-flash');
const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const User = require("./models/user.js");

const dbUrl = process.env.ATLASDB_URL;

main().then(() => { console.log("connection is successful") })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(dbUrl);

}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
app.listen(8080, (req, res) => {
    console.log("server is listening on port 8080");
});


const store = MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error",(err)=>{
    console.log("Error in Mongo session store",err);
});
const sessionOptions ={
    store,
    secret:process.env.SECRET,
    resave:false ,
    saveUninitialized:true,
    cookie:{
        expires: Date.now() + 7 * 24 * 60 * 60 *1000,
        maxAge : 7 * 24 * 60 * 60 *1000,
        httpOnly:true,
    },
};


// app.get("/", (req, res) => {
//     res.send("I'm home page");
// });
app.get("/", (req, res) => {
  res.send("Hello");
});

app.use((req, res) => {
  res.status(404).send("Page not found");
});


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});



app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter);

app.use((err,req,res,next)=>{
    let {statusCode=500,message="something went wrong"} = err;
    res.status(statusCode).render("error.ejs",{err});
    // res.status(statusCode).send(message);
});


app.all('*path',(req,res,next)=>{
    next(new ExpressError(404,"page not found"));
});
