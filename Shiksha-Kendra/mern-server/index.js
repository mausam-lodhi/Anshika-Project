const express = require('express');
const cors = require('cors');
const path = require("path");
require("dotenv").config();
const { connectDB } = require("./config/database");

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

app.use("/", require("./routes/books"));
app.use("/", require("./routes/comments"));
app.use("/", require("./routes/stories"));
app.use("/", require("./routes/stats"));

// Serve static files from client build
app.use(express.static(path.join(__dirname, "../mern-client/dist")));

// Handle client-side routing - fallback to index.html for non-API routes
app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "../mern-client/dist", "index.html"));
});

// Server listening
if (process.env.NODE_ENV !== "production") {
	app.listen(port, () => console.log(`🚀 Server listening on port ${port}`));
} else {
	app.listen(port);
}

module.exports = app;
