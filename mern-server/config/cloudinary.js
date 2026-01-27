const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

// Cloudinary Configuration
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
	cloudinary: cloudinary,
	params: {
		folder: "shiksha_kendra_books",
		// Use raw so direct downloads (PDF/PPT/etc.) work without auth errors
		resource_type: "raw",
		allowed_formats: ["pdf", "ppt", "pptx", "doc", "docx", "txt", "csv", "zip"],
	},
});

module.exports = {
	cloudinary,
	storage
};
