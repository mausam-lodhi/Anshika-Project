const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDB } = require('./config/database');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(
	cors({
		origin: process.env.CLIENT_URL || "https://anshika-project.onrender.com",
		methods: ["GET", "POST", "PUT", "DELETE"],
		credentials: true,
	})
);
app.use(express.json());

// Initialize database connection
connectDB();

// Routes
app.get("/", (req, res) => res.send("Shiksha Kendra Server Running"));

app.use("/", require('./routes/books'));
app.use("/", require('./routes/comments'));
app.use("/", require('./routes/stories'));
app.use("/", require('./routes/stats'));

// Server listening
if (process.env.NODE_ENV !== "production") {
	app.listen(port, () => console.log(`🚀 Server listening on port ${port}`));
} else {
	app.listen(port);
}

module.exports = app;
