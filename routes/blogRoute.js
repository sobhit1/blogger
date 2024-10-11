const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Blog = require("../models/blog");

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
    } else {
        cb(new Error('Error: File type not supported!'), false);
    }
};

const upload = multer({ 
    storage,
    fileFilter
});

router.get("/add-new", async (req, res) => {
    res.render("addBlog", { user: req.user });
});

router.post("/", upload.single("coverImage"), async (req, res) => {
    const { title, content } = req.body;

    if (!req.file) {
        return res.status(400).send("Error: No file uploaded.");
    }

    try {
        const newBlog = new Blog({
            title,
            content,
            coverImage: `/uploads/${req.file.filename}`,
            createdBy: req.user._id
        });

        await newBlog.save(); 
        return res.redirect(`/blog/${newBlog._id}`);
    } catch (err) {
        console.error("Error saving blog:", err);
        return res.status(500).send("Error saving blog.");
    }
});

module.exports = router;
