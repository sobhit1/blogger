const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const { checkForAuthCookie } = require("./middlewares/auth");
require("dotenv").config();
const userRoutes = require("./routes/userRoutes");
const blogRoutes = require("./routes/blogRoute");
const Blog = require("./models/blog");

const app = express();

const mongoUrl = process.env.MONGO_URL;
const port = process.env.PORT || 8000;

if (!mongoUrl) {
  console.error("Error: MONGO_URL not set in .env file");
  process.exit(1);
}

mongoose
  .connect(mongoUrl)
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
app.use(express.static(path.resolve("./public")));

app.get("/", async (req, res) => {
  try {
    const allBlogs = await Blog.find({}).sort({ createdAt: -1 });
    res.render("home", { user: req.user, blogs: allBlogs });
  } catch (err) {
    console.error("Error fetching blogs:", err);
    res.status(500).send("Error fetching blogs.");
  }
});

app.use("/user", userRoutes);
app.use("/blog", blogRoutes);

app.listen(port, (err) => {
  if (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
  console.log(`Server started on http://localhost:${port}`);
});