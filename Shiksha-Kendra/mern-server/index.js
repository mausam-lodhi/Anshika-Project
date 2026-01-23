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

// API Routes - must be defined before static file serving
app.use("/", require("./routes/books"));
app.use("/", require("./routes/comments"));
app.use("/", require("./routes/stories"));
app.use("/", require("./routes/stats"));

// Health check endpoint (for server monitoring)
app.get("/api/health", (req, res) => res.send("Shiksha Kendra Server Running"));

// Serve static files from client build (CSS, JS, images, etc.)
const staticPath = path.join(__dirname, "../mern-client/dist");
const fs = require("fs");

// Check if dist folder exists
if (!fs.existsSync(staticPath)) {
	console.warn(`⚠️  Warning: Static files directory not found at ${staticPath}`);
	console.warn("Make sure to build the client before starting the server: cd ../mern-client && npm run build");
} else {
	console.log(`✅ Serving static files from: ${staticPath}`);
}

// Serve static files (CSS, JS, images, etc.) but not index.html
app.use(express.static(staticPath, {
	index: false, // Don't serve index.html for directory requests
	fallthrough: true // Continue to next middleware if file not found
}));

// Handle client-side routing - fallback to index.html for all non-API routes
// This must be last to catch all routes that don't match API or static files
// API routes are already defined above, so they'll be matched first
app.get("*", (req, res) => {
	const indexPath = path.join(staticPath, "index.html");

	// Check if index.html exists
	if (!fs.existsSync(indexPath)) {
		console.error(`❌ Error: index.html not found at ${indexPath}`);
		return res.status(500).send(`
			<h1>Application Error</h1>
			<p>index.html not found. Please build the client application first.</p>
			<p>Path: ${indexPath}</p>
		`);
	}

	// Serve index.html for all non-API routes (SPA routing)
	res.sendFile(indexPath, (err) => {
		if (err) {
			console.error("Error sending index.html:", err);
			if (!res.headersSent) {
				res.status(500).send("Error loading application");
			}
		}
	});
});

// Server listening
if (process.env.NODE_ENV !== "production") {
	app.listen(port, () => console.log(`🚀 Server listening on port ${port}`));
} else {
	app.listen(port);
}

module.exports = app;
