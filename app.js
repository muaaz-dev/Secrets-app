//jshint esversion:6

require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const PORT = 3000;

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// Database connection
async function connectDB() {
  const conn = await mongoose.connect("mongodb://127.0.0.1:27017/userDB");
  console.log("Database connected!");
}

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

userSchema.plugin(encrypt, {
  secret: process.env.SECRET,
  encryptedFields: ["password"],
});

const User = new mongoose.model("User", userSchema);

// Routes
app.get("/", function (req, res) {
  res.render("home");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", function (req, res) {
  const newUser = new User({
    email: req.body.username,
    password: req.body.password,
  });
  newUser
    .save()
    .then(function () {
      res.render("secrets");
    })
    .catch((err) => {
      console.log(err);
    });
});
app.post("/login", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  async function loginAuthentication() {
    const foundUser = await User.findOne({ email: username });
    try {
      if (foundUser) {
        if (foundUser.password === password) {
          res.render("secrets");
        }
      }
    } catch {
      (err) => {
        console.log(err);
      };
    }
  }
  loginAuthentication();
});

// connect DB
connectDB().then(function () {
  app.listen(PORT, function (req, res) {
    console.log("Server running on PORT: " + PORT);
  });
});
