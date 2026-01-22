const express = require('express');
const router = express.Router();
const {
	getSiteStats,
	trackDownload
} = require('../controllers/statsController');

// Stats routes
router.get("/site-stats", getSiteStats);
router.post("/track-download", trackDownload);

module.exports = router;
