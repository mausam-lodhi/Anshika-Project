const { ObjectId } = require('mongodb');
const { connectDB, getCollections } = require('../config/database');

// Helper to build a Cloudinary attachment URL so the browser downloads with a proper filename/extension
const buildAttachmentUrl = (fileUrl, filename) => {
	try {
		const url = new URL(fileUrl);
		if (!url.searchParams.has('fl_attachment')) {
			url.searchParams.set('fl_attachment', filename);
		}
		return url.toString();
	} catch (err) {
		console.error('Invalid file URL, falling back to raw URL:', err);
		return fileUrl;
	}
};

// Upload book
const uploadBook = async (req, res) => {
	try {
		await connectDB();
		const { booksCollections } = getCollections();
		const { bookTitle, authorName, imageURL, category, bookDescription } = req.body;
		const bookPDFURL = req.file ? req.file.path : null;

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
			createdAt: new Date(),
		};

		const result = await booksCollections.insertOne(newBook);
		res.status(201).json({ message: "Book uploaded successfully", id: result.insertedId });
	} catch (error) {
		console.error("Upload error:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Download book file with Content-Disposition via Cloudinary fl_attachment
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

		const inferredName = (() => {
			const raw = (book.bookPDFURL || '').split('?')[0].split('/').pop();
			if (raw && raw.includes('.')) return raw;
			return `${book.bookTitle || 'resource'}.pdf`;
		})();

		const redirectUrl = buildAttachmentUrl(book.bookPDFURL, inferredName);
		return res.redirect(302, redirectUrl);
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
