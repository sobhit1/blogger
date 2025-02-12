const express = require("express");
const router = express.Router();
const User = require("../models/userSchema");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

router.get("/signin", (req, res) => {
  res.render("signin");
});

router.get("/signup", (req, res) => {
  res.render("signup");
});

router.post("/signup",
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("signup", { error: errors.array()[0].msg });
    }
    const { name, email, password } = req.body;
    try {
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.render("signup", { error: "User already exists" });
      }
      const newUser = new User({ name, email, password: password });
      await newUser.save();
      return res.redirect("/signin");
    }
    catch (err) {
      console.error("Error during sign up:", err.message);
      return res.render("signup", { error: "Something went wrong, please try again" });
    }
  }
);

router.post("/signin",
  [
    body('email').isEmail().normalizeEmail().withMessage('Invalid email format'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("signin", { error: errors.array()[0].msg });
    }
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.render("signin", { error: "User not found" });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.render("signin", { error: "Invalid Password" });
      }
      const token = await User.matchPasswordAndGenerateToken(email, password);
      if (!token) {
        return res.render("signin", { error: "Invalid Password" });
      }
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: 'Strict',
        maxAge: 24 * 60 * 60 * 1000
      }).redirect("/");
    }
    catch (err) {
      console.error("Error during sign in:", err.message);
      return res.render("signin", { error: "Something went wrong, please try again" });
    }
  }
);

router.get("/signout", (req, res) => {
  res.clearCookie("token", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: 'Strict' }).redirect("/");
});

module.exports = router;