const express = require('express');
const router = express.Router();
const {
	getCommentsByBookId,
	addComment
} = require('../controllers/commentController');

// Comment routes
router.get("/comments/:id", getCommentsByBookId);
router.post("/add-comment", addComment);

module.exports = router;
