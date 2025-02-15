const express = require("express");
const router = express.Router();
// const upload = require("../multer");
const upload = require("../cloudinary");
const { searchBlog, displayBlog, deleteBlog, deleteComment, addComment, blogUpload } = require("../controllers/blogControllers");

router.get("/add-new", (req, res) => {
    res.render("addBlog", { user: req.user });
});

router.get("/search", searchBlog);

router.get("/:blogId", displayBlog);

router.post("/delete/:blogId", deleteBlog);

router.post("/comment/delete/:commId", deleteComment);

router.post("/comment/:blogId", addComment);

router.post("/", upload.single("coverImage"), blogUpload);

module.exports = router;