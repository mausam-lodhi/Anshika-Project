const { connectDB, getCollections } = require('../config/database');

// Get all stories
const getAllStories = async (req, res) => {
	try {
		await connectDB();
		const { storiesCollection } = getCollections();
		const stories = await storiesCollection.find({}).sort({ createdAt: -1 }).toArray();
		res.json(stories);
	} catch (error) {
		console.error("Error fetching stories:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Add story
const addStory = async (req, res) => {
	try {
		await connectDB();
		const { storiesCollection } = getCollections();
		const storyData = {
			...req.body,
			createdAt: new Date(),
		};
		const result = await storiesCollection.insertOne(storyData);
		const insertedStory = await storiesCollection.findOne({ _id: result.insertedId });
		res.status(201).json(insertedStory);
	} catch (error) {
		console.error("Error adding story:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

module.exports = {
	getAllStories,
	addStory
};
