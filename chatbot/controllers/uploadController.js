const supabase = require('../supabase/supabaseClient'); // Import your Supabase client
const multer = require('multer');
const path = require('path');

// Multer setup for handling file uploads
const storage = multer.memoryStorage(); // Using memory storage
const upload = multer({ storage: storage });

const handleFileUpload = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file provided' });
    }

    try {
        const { originalname, buffer, mimetype } = req.file;
        const { bucketName } = req.query;
        const fileName = `${Date.now()}_${originalname}`;
        const pathName = '/'+bucketName+'/'+fileName

        // Upload file to Supabase Storage
        const { data, error } = await supabase
            .storage
            .from('bucket-primary')
            .upload(pathName, buffer, { contentType: mimetype });

        if (error) {
            console.log(data)
            console.log('throwing error #fff672')
            throw error;
        }

        // Get the public URL for the uploaded file
        const { publicURL, error: urlError } = supabase
            .storage
            .from('bucket-primary')
            .getPublicUrl(pathName);

        if (urlError) {
            throw urlError;
        }

        res.status(200).json({
            message: 'File uploaded successfully',
            fileUrl: publicURL,
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error uploading file', error: error.message });
    }
};

// Export the controller and multer instance
module.exports = {
    handleFileUpload,
    upload
};
