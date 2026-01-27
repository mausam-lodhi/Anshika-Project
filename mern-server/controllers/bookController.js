const { ObjectId } = require('mongodb');
const { connectDB, getCollections } = require('../config/database');
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { pipeline } = require("stream");

const inferDownloadName = (book) => {
	const tryName = (val) => (val && /\.[a-z0-9]+$/i.test(val) ? val : null);
	const fromUrl = (() => {
		const raw = (book.bookPDFURL || "").split("?")[0].split("/").pop();
		return tryName(raw);
	})();
	return tryName(book.originalFileName) || fromUrl || `${book.bookTitle || "resource"}.pdf`;
};

const inferContentType = (filename) => {
	const ext = path.extname(filename).toLowerCase();
	switch (ext) {
		case ".pdf":
			return "application/pdf";
		case ".doc":
			return "application/msword";
		case ".docx":
			return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
		case ".ppt":
			return "application/vnd.ms-powerpoint";
		case ".pptx":
			return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
		default:
			return "application/octet-stream";
	}
};

// Upload book
const uploadBook = async (req, res) => {
	try {
		await connectDB();
		const { booksCollections } = getCollections();
		const { bookTitle, authorName, imageURL, category, bookDescription } = req.body;
		const bookPDFURL = req.file ? req.file.path : null;
		const originalFileName = req.file ? req.file.originalname : null;

		if (!bookPDFURL) {
			return res.status(400).json({ message: "File upload failed" });
		}

		const newBook = {
			bookTitle,
			authorName,
			imageURL,
			category,
			bookDescription,
			bookPDFURL,
			originalFileName,
			createdAt: new Date(),
		};

		const result = await booksCollections.insertOne(newBook);
		res.status(201).json({ message: "Book uploaded successfully", id: result.insertedId });
	} catch (error) {
		console.error("Upload error:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Stream download with proper Content-Disposition so it saves as the right format
const downloadBookFile = async (req, res) => {
	try {
		await connectDB();
		const { booksCollections } = getCollections();
		const { id } = req.params;

		if (!ObjectId.isValid(id)) {
			return res.status(400).json({ message: 'Invalid book ID format' });
		}

		const book = await booksCollections.findOne({ _id: new ObjectId(id) });
		if (!book || !book.bookPDFURL) {
			return res.status(404).json({ message: 'File not found for this book' });
		}

		const filename = inferDownloadName(book);
		const contentType = inferContentType(filename);
		const fileUrl = book.bookPDFURL;
		const isHttp = /^https?:\/\//i.test(fileUrl);

		if (isHttp) {
			const response = await axios.get(fileUrl, { responseType: "stream" });
			res.setHeader("Content-Type", response.headers["content-type"] || contentType);
			res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(filename)}"`);
			return pipeline(response.data, res, (err) => {
				if (err) {
					console.error("Streaming error:", err);
					if (!res.headersSent) res.status(500).json({ message: "Error streaming file" });
				}
			});
		}

		const absolutePath = path.isAbsolute(fileUrl) ? fileUrl : path.join(__dirname, "..", fileUrl);
		if (!fs.existsSync(absolutePath)) {
			return res.status(404).json({ message: "File not found on server" });
		}

		res.setHeader("Content-Type", contentType);
		res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(filename)}"`);
		const stream = fs.createReadStream(absolutePath);
		return pipeline(stream, res, (err) => {
			if (err) {
				console.error("Streaming error:", err);
				if (!res.headersSent) res.status(500).json({ message: "Error streaming file" });
			}
		});
	} catch (error) {
		console.error('Download error:', error);
		return res.status(500).json({ message: 'Server error', error: error.message });
	}
};

// Get all books
const getAllBooks = async (req, res) => {
	try {
		await connectDB();
		const { booksCollections } = getCollections();
		const books = await booksCollections.find({}).toArray();
		res.json(books);
	} catch (error) {
		console.error("Error fetching books:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Get single book by ID
const getBookById = async (req, res) => {
	try {
		await connectDB();
		const { booksCollections } = getCollections();
		const { id } = req.params;

		// Validate ObjectId format
		if (!ObjectId.isValid(id)) {
			return res.status(400).json({ message: "Invalid book ID format" });
		}

		const book = await booksCollections.findOne({ _id: new ObjectId(id) });
		if (!book) {
			return res.status(404).json({ message: "Book not found" });
		}
		res.json(book);
	} catch (error) {
		console.error("Error fetching book:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Update book
const updateBook = async (req, res) => {
	try {
		await connectDB();
		const { booksCollections } = getCollections();
		const { id } = req.params;

		// Validate ObjectId format
		if (!ObjectId.isValid(id)) {
			return res.status(400).json({ message: "Invalid book ID format" });
		}

		const updateData = req.body;
		const result = await booksCollections.updateOne(
			{ _id: new ObjectId(id) },
			{ $set: updateData }
		);
		if (result.matchedCount === 0) {
			return res.status(404).json({ message: "Book not found" });
		}
		res.json({ message: "Book updated successfully" });
	} catch (error) {
		console.error("Error updating book:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Delete book
const deleteBook = async (req, res) => {
	try {
		await connectDB();
		const { booksCollections } = getCollections();
		const { id } = req.params;

		// Validate ObjectId format
		if (!ObjectId.isValid(id)) {
			return res.status(400).json({ message: "Invalid book ID format" });
		}

		const result = await booksCollections.deleteOne({ _id: new ObjectId(id) });
		if (result.deletedCount === 0) {
			return res.status(404).json({ message: "Book not found" });
		}
		res.json({ message: "Book deleted successfully" });
	} catch (error) {
		console.error("Error deleting book:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

module.exports = {
	uploadBook,
	getAllBooks,
	getBookById,
	updateBook,
	deleteBook,
	downloadBookFile,
};
