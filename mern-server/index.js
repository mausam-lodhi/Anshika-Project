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
		origin: process.env.CLIENT_URL, // Frontend URL
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
const fs = require("fs");

// Log current working directory and __dirname for debugging
console.log(`📁 Current working directory: ${process.cwd()}`);
console.log(`📁 Server __dirname: ${__dirname}`);

// Try multiple possible paths for dist folder (for different deployment scenarios)
const possiblePaths = [
	path.join(__dirname, "../mern-client/dist"), // Local development / relative path (most common)
	path.join(__dirname, "../../mern-client/dist"), // Alternative relative path
	path.join(process.cwd(), "mern-client/dist"), // From project root
	path.join(process.cwd(), "../mern-client/dist"), // Alternative from root
	path.join(process.cwd(), "Shiksha-Kendra/mern-client/dist"), // Render with Shiksha-Kendra root
	path.join(process.cwd(), "../Shiksha-Kendra/mern-client/dist"), // Alternative Render path
	"/opt/render/project/src/Shiksha-Kendra/mern-client/dist", // Render absolute path
	"/opt/render/project/src/mern-client/dist", // Render alternative absolute path
];

// Also try to find mern-client folder and check if dist exists
const possibleClientPaths = [
	path.join(__dirname, "../mern-client"),
	path.join(__dirname, "../../mern-client"),
	path.join(process.cwd(), "mern-client"),
	path.join(process.cwd(), "../mern-client"),
	path.join(process.cwd(), "Shiksha-Kendra/mern-client"),
	"/opt/render/project/src/Shiksha-Kendra/mern-client",
];

let staticPath = null;
for (const testPath of possiblePaths) {
	if (fs.existsSync(testPath) && fs.existsSync(path.join(testPath, "index.html"))) {
		staticPath = testPath;
		console.log(`✅ Found static files at: ${staticPath}`);
		break;
	}
}

if (!staticPath) {
	console.error("❌ ERROR: Static files directory not found!");
	console.error("Tried paths:");
	possiblePaths.forEach(p => {
		const exists = fs.existsSync(p);
		console.error(`  - ${p} ${exists ? '✅ EXISTS' : '❌ NOT FOUND'}`);
	});

	// Check if mern-client folder exists
	console.error("\n🔍 Checking for mern-client folder:");
	let clientPathFound = false;
	for (const clientPath of possibleClientPaths) {
		if (fs.existsSync(clientPath)) {
			console.error(`  ✅ Found mern-client at: ${clientPath}`);
			const distPath = path.join(clientPath, "dist");
			if (fs.existsSync(distPath)) {
				console.error(`    ✅ dist folder exists but index.html missing`);
			} else {
				console.error(`    ❌ dist folder does NOT exist - BUILD REQUIRED`);
			}
			clientPathFound = true;
		}
	}

	if (!clientPathFound) {
		console.error("  ❌ mern-client folder not found in any expected location");
	}

	console.error("\n⚠️  SOLUTION: Set Render Build Command to:");
	console.error("   cd Shiksha-Kendra/mern-client && npm install && npm run build");
	console.error("   OR");
	console.error("   cd mern-client && npm install && npm run build");
	console.error("\n   Then set Start Command to:");
	console.error("   cd Shiksha-Kendra/mern-server && npm install && npm start");
}

// Serve static files (CSS, JS, images, etc.) but not index.html
if (staticPath) {
	app.use(express.static(staticPath, {
		index: false, // Don't serve index.html for directory requests
		fallthrough: true // Continue to next middleware if file not found
	}));
}

// Handle client-side routing - fallback to index.html for all non-API routes
// This must be last to catch all routes that don't match API or static files
// API routes are already defined above, so they'll be matched first
// Handle all HTTP methods for SPA routing
app.all("*", (req, res) => {
	// Only handle GET requests for SPA routing, let other methods pass through
	if (req.method !== "GET") {
		return res.status(404).json({ error: "Route not found" });
	}
	// If static path not found, show helpful error
	if (!staticPath) {
		return res.status(500).send(`
			<!DOCTYPE html>
			<html>
			<head>
				<title>Build Error</title>
				<style>
					body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
					h1 { color: #e74c3c; }
					code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
					pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
				</style>
			</head>
			<body>
				<h1>🚨 Build Error</h1>
				<p><strong>Static files directory not found!</strong></p>
				<p>The client application needs to be built before the server can serve it.</p>
				<h2>Solution:</h2>
				<p>In your Render dashboard, set the <strong>Build Command</strong> to:</p>
				<pre>cd Shiksha-Kendra/mern-client && npm install && npm run build</pre>
				<p>Or if your root directory is different:</p>
				<pre>cd mern-client && npm install && npm run build</pre>
				<p>Then redeploy your service.</p>
			</body>
			</html>
		`);
	}

	const indexPath = path.join(staticPath, "index.html");

	// Check if index.html exists
	if (!fs.existsSync(indexPath)) {
		console.error(`❌ Error: index.html not found at ${indexPath}`);
		return res.status(500).send(`
			<h1>Application Error</h1>
			<p>index.html not found at: ${indexPath}</p>
			<p>Please rebuild the client application.</p>
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
