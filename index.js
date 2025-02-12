require("dotenv").config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const { checkForAuthCookie } = require("./middlewares/auth");
const userRoutes = require("./routes/userRoutes");
const blogRoutes = require("./routes/blogRoute");
const Blog = require("./models/blog");

const app = express();

const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT || 8000;

if (!MONGO_URL) {
  console.error("Error: MONGO_URL is not set in .env file");
  process.exit(1);
}

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("MongoDB Connected Successfully!");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

connectDB();

app.set("view engine", "ejs");
app.set("views", path.resolve("views"));

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthCookie("token"));
app.use(express.static(path.resolve("public")));

app.get("/", async (req, res) => {
  try {
    const allBlogs = await Blog.find({}).sort({ createdAt: -1 });
    res.render("home", { user: req.user, blogs: allBlogs });
  }
  catch (error) {
    console.error("Error Fetching Blogs:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.use("/user", userRoutes);
app.use("/blog", blogRoutes);

app.use((err, req, res, next) => {
  console.error("Unexpected Error:", err);
  res.status(500).json({ message: "Something went wrong. Please try again later." });
});

app.listen(PORT, () => {
  console.log(`Server running at: http://localhost:${PORT}`);
});