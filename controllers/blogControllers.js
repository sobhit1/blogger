const Blog = require("../models/blog");
const Comment = require("../models/comment");

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
        const blog = await Blog.findById(req.params.id).populate("createdBy");
        const comments = await Comment.find({ blogID: req.params.id }).populate("createdBy");
        res.render("viewBlog", { blog, comments, user: req.user });
    }
    catch (err) {
        console.error("Error retrieving blog", err);
        res.status(500).send("Error retrieving blog.");
    }
}

const deleteBlog = async (req, res) => {
    try {
        await Comment.deleteMany({ blogID: req.params.id });
        const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
        if (!deletedBlog) {
            return res.status(404).send("Blog not found.");
        }
        return res.redirect(`/`);
    }
    catch (err) {
        console.error("Error deleting blog :", err);
        res.status(500).send("Error deleting blog.");
    }
}
const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
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
}

const blogUpload = async (req, res) => {
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
}

module.exports = { searchBlog, displayBlog, deleteBlog, deleteComment, addComment, blogUpload };