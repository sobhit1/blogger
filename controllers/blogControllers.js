const Blog = require("../models/blog");
const Comment = require("../models/comment");
const cloudinary = require('cloudinary').v2;

const searchBlog = async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.status(400).json({ message: "Query parameter is required" });
        }
        const blogs = await Blog.find({
            title: { $regex: query.toString(), $options: "i" }
        });
        return res.json(blogs.length ? blogs : { message: "No results found" });
    }
    catch (err) {
        console.error("Error searching blogs:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const displayBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.blogId).populate("createdBy");
        const comments = await Comment.find({ blogID: req.params.blogId }).populate("createdBy");
        res.render("viewBlog", { blog, comments, user: req.user });
    }
    catch (err) {
        console.error("Error retrieving blog", err);
        res.status(500).send("Error retrieving blog.");
    }
}

const deleteBlog = async (req, res) => {
    try {
        const blogId = req.params.blogId;
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).send("Blog not found");
        }
        const imagePublicId = `uploads/${blog.coverImage.split('/upload/')[1].split('.')[0].split('/')[2]}`;
        if (imagePublicId) {
            await cloudinary.uploader.destroy(imagePublicId);
        }
        await Comment.deleteMany({ blogID: blogId });
        await Blog.findByIdAndDelete(blogId);
        res.redirect("/");
    }
    catch (error) {
        console.error("Error deleting blog:", error);
        res.status(500).send("Error deleting blog.");
    }
}
const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commId);
        if (!comment) {
            return res.status(404).send("Comment not found.");
        }
        await Comment.deleteOne({ _id: comment._id });
        return res.redirect(`/blog/${comment.blogID}`);
    }
    catch (err) {
        console.error("Error deleting comment :", err);
        res.status(500).send("Error deleting comment.");
    }
}

const addComment = async (req, res) => {
    try {
        const { comment } = req.body;
        const blogId = req.params.blogId;
        if (!comment || !comment.trim()) {
            return res.status(400).json({ error: "Comment cannot be empty." });
        }
        const newComment = new Comment({
            content: comment.trim(),
            blogID: blogId,
            createdBy: req.user._id
        });
        await newComment.save();
        return res.redirect(`/blog/${blogId}`);
    }
    catch (err) {
        console.error("Error saving comment:", err);
        res.status(500).json({ error: "An error occurred while saving the comment." });
    }
};

const blogUpload = async (req, res) => {
    const { title, content } = req.body;
    if (!title || !content || !req.file) {
        return res.status(400).send("Error: Title, content and cover image are required.");
    }
    try {
        const newBlog = new Blog({
            title: title.trim(),
            content: content.trim(),
            coverImage: req.file.path,
            createdBy: req.user._id
        });
        await newBlog.save();
        return res.redirect(`/blog/${newBlog._id}`);
    }
    catch (err) {
        console.error("Error saving blog:", err);
        return res.status(500).send("Error saving blog.");
    }
}

module.exports = { searchBlog, displayBlog, deleteBlog, deleteComment, addComment, blogUpload };