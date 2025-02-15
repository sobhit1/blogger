const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { searchBlog, displayBlog, deleteBlog, deleteComment, addComment, blogUpload } = require("../controllers/blogControllers");

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

router.get("/search", searchBlog);

router.get("/:id", displayBlog);

router.post("/delete/:id", deleteBlog);

router.post("/comment/delete/:id", deleteComment);

router.post("/comment/:blogId", addComment);

router.post("/", upload.single("coverImage"), blogUpload);

module.exports = router;