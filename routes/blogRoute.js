const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Blog = require("../models/blog");
const Comment = require("../models/comment");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.resolve(`./public/uploads`));
    },
    filename: (req, file, cb) => {
        const filename = `${Date.now()}-${file.originalname}`;
        cb(null, filename);
    }
});

const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    }
    else {
        cb(new Error('Error: File type not supported!'), false);
    }
};

const upload = multer({ 
    storage,
    fileFilter
});

router.get("/add-new", (req, res) => {
    res.render("addBlog", { user: req.user });
});

router.get("/:id", async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id).populate("createdBy");
        const comments = await Comment.find({ blogID: req.params.id }).populate("createdBy");
        res.render("viewBlog", { blog, comments, user: req.user });
    }
    catch (err) {
        console.error("Error retrieving blog or comments:", err);
        res.status(500).send("Error retrieving blog or comments.");
    }
});

router.post("/comment/:blogId", async (req, res) => {
    const { comment } = req.body;
    if (!comment || !comment.trim()) {
        return res.status(400).send("Comment cannot be empty.");
    }
    try {
        const newComment = new Comment({
            content: comment.trim(),
            blogID: req.params.blogId,
            createdBy: req.user._id
        });
        await newComment.save();
        return res.redirect(`/blog/${req.params.blogId}`);
    }
    catch (err) {
        console.error("Error saving comment:", err);
        res.status(500).send("Error saving comment.");
    }
});

router.post("/", upload.single("coverImage"), async (req, res) => {
    const { title, content } = req.body;
    if (!title || !content || !req.file) {
        return res.status(400).send("Error: Title, content, and cover image are required.");
    }
    try {
        const newBlog = new Blog({
            title: title.trim(),
            content: content.trim(),
            coverImage: `/uploads/${req.file.filename}`,
            createdBy: req.user._id
        });
        await newBlog.save();
        return res.redirect(`/blog/${newBlog._id}`);
    }
    catch (err) {
        console.error("Error saving blog:", err);
        return res.status(500).send("Error saving blog.");
    }
});

module.exports = router;