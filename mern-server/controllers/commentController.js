const { connectDB, getCollections } = require('../config/database');

// Get comments for a book
const getCommentsByBookId = async (req, res) => {
	try {
		await connectDB();
		const { commentsCollection } = getCollections();
		const { id } = req.params;
		const comments = await commentsCollection.find({ bookId: id }).toArray();
		res.json(comments);
	} catch (error) {
		console.error("Error fetching comments:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Add comment
const addComment = async (req, res) => {
	try {
		await connectDB();
		const { commentsCollection } = getCollections();
		const commentData = {
			...req.body,
			createdAt: new Date(),
		};
		const result = await commentsCollection.insertOne(commentData);
		res.status(201).json({ message: "Comment added", id: result.insertedId });
	} catch (error) {
		console.error("Error adding comment:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

module.exports = {
	getCommentsByBookId,
	addComment
};
