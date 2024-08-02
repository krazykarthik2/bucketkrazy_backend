const express = require('express');
const router = express.Router();
const { handleFileUpload, upload } = require('./../controllers/uploadController');

// Define route for file uploads
router.post('/upload', upload.single('file'), handleFileUpload);

module.exports = router;
