const express = require("express");
const router = express.Router();
const User = require("../models/userSchema");

function sendResponse(statusCode = 200, success, message, data, res) {
  return res.status(statusCode).send({
    success: success,
    message: message,
    data: data,
  });
}

router.get("/signin", (req, res) => {
  res.render("signin");
});

router.get("/signup", (req, res) => {
  res.render("signup");
});

router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return sendResponse(400, false, "All fields are required", null, res);
  }
  try {
    const user = await User.findOne({ email });
    if (user) {
      return sendResponse(400, false, "User already exists", null, res);
    }
    const newUser = new User({ name, email, password });
    await newUser.save();
    return res.redirect("/");
  } catch (err) {
    return sendResponse(500, false, err.message, null, res);
  }
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return sendResponse(400, false, "All fields are required", null, res);
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return sendResponse(400, false, "User does not exist", null, res);
    }
    const isMatched = await User.matchPassword(email, password);
    if (!isMatched) {
      return sendResponse(400, false, "Invalid Password", null, res);
    }
    return res.redirect("/");
  } catch (err) {
    return sendResponse(500, false, err.message, null, res);
  }
});

module.exports = router;