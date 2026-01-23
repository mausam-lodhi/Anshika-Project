const express = require('express');
const router = express.Router();
const {
	getAllStories,
	addStory
} = require('../controllers/storyController');

// Story routes
router.get("/all-stories", getAllStories);
router.post("/add-story", addStory);

module.exports = router;
