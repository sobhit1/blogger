const express = require("express");
const router = express.Router();
// const upload = require("../multer");
const upload = require("../cloudinary");
const { searchBlog, displayBlog, deleteBlog, deleteComment, addComment, blogUpload } = require("../controllers/blogControllers");

router.get("/add-new", (req, res) => {
    res.render("addBlog", { user: req.user });
});

router.get("/search", searchBlog);

router.get("/:id", displayBlog);

router.post("/delete/:id", deleteBlog);

router.post("/comment/delete/:id", deleteComment);

router.post("/comment/:blogId", addComment);

router.post("/", upload.single("coverImage"), blogUpload);

module.exports = router;