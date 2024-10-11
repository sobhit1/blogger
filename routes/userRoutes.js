const express = require("express");
const router = express.Router();
const User = require("../models/userSchema");

router.get("/signin", (req, res) => {
  res.render("signin");
});

router.get("/signup", (req, res) => {
  res.render("signup");
});

router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.render("signup", { error: "All fields are required" });
  }
  try {
    const user = await User.findOne({ email });
    if (user) {
      return res.render("signup", { error: "User already exists" });
    }
    const newUser = new User({ name, email, password });
    await newUser.save();
    return res.redirect("/signin");
  } catch (err) {
    console.error("Error during sign up:", err.message);
    return res.render("signup", { error: "Something went wrong, please try again" });
  }
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.render("signin", { error: "All fields are required" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.render("signin", { error: "User not found" });
    }
    const token = await User.matchPasswordAndGenerateToken(email, password);
    if (!token) {
      return res.render("signin", { error: "Invalid Password" });
    }
    return res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" }).redirect("/");
  } catch (err) {
    console.error("Error during sign in:", err.message);
    return res.render("signin", { error: "Something went wrong, please try again" });
  }
});

router.get("/signout", (req, res) => {
  res.clearCookie("token").redirect("/");
});

module.exports = router;