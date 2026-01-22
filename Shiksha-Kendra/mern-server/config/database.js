const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
	serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
});

let db, booksCollections, commentsCollection, storiesCollection, countersCollection;

async function connectDB() {
	if (db) return db;
	try {
		await client.connect();
		db = client.db("BookInventory");
		booksCollections = db.collection("books");
		commentsCollection = db.collection("comments");
		storiesCollection = db.collection("stories");
		countersCollection = db.collection("siteStats");
		return db;
	} catch (error) {
		console.error("MongoDB Connection Error:", error);
		throw error;
	}
}

function getCollections() {
	return {
		booksCollections,
		commentsCollection,
		storiesCollection,
		countersCollection
	};
}

module.exports = {
	connectDB,
	getCollections
};
