const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
	uploadBook,
	getAllBooks,
	getBookById,
	updateBook,
	deleteBook
} = require('../controllers/bookController');

// Book routes
router.post("/upload-books", upload.single("bookFile"), uploadBook);
router.get("/all-books", getAllBooks);
router.get("/book/:id", getBookById);
router.put("/book/:id", updateBook);
router.delete("/book/:id", deleteBook);

module.exports = router;
