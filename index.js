const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const { checkForAuthCookie } = require("./middlewares/auth");
require("dotenv").config();
const userRoutes = require("./routes/userRoutes");

const app = express();

if (!process.env.MONGO_URL) {
  console.error("Error: MONGO_URL not set in the environment variables.");
  process.exit(1); 
}

if (!process.env.PORT) {
  console.error("Error: PORT not set in the environment variables.");
  process.exit(1); 
}

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthCookie("token")); 

app.get("/", (req, res) => {
  res.render("home", { user: req.user || null });
});

app.use("/user", userRoutes);

app.listen(process.env.PORT, (err) => {
  if (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
  console.log(`Server started on http://localhost:${process.env.PORT}`);
});