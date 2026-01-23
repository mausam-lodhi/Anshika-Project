const { connectDB, getCollections } = require('../config/database');

// Get site stats
const getSiteStats = async (req, res) => {
	try {
		await connectDB();
		const { booksCollections, countersCollection } = getCollections();
		const stats = await countersCollection.findOne({ _id: "stats" });
		const bookCount = await booksCollections.countDocuments();

		res.json({
			userCount: bookCount || 0,
			resourceCount: stats?.resourceCount || 0,
		});
	} catch (error) {
		console.error("Error fetching stats:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Track download
const trackDownload = async (req, res) => {
	try {
		await connectDB();
		const { countersCollection } = getCollections();
		await countersCollection.updateOne(
			{ _id: "stats" },
			{ $inc: { resourceCount: 1 } },
			{ upsert: true }
		);
		res.json({ message: "Download tracked" });
	} catch (error) {
		console.error("Error tracking download:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

module.exports = {
	getSiteStats,
	trackDownload
};
