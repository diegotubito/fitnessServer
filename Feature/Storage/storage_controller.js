const { request, response } = require("express");
const path = require('path');
const axios = require('axios');
const fs = require('fs');

const uploadFile = async (req = request, res = response) => {
    const fileBuffer = req.file.buffer;
    const filepath = req.query.filepath;
    const bucket = req.app.get('bucket');
    const file = bucket.file(`${filepath}`);
    
    try {
        // Save the file to the bucket
        await new Promise((resolve, reject) => {
            file.save(fileBuffer, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // Generate a signed URL for the file
        const [signedUrl] = await file.getSignedUrl({
            action: 'read',
            expires: '12-31-2077' // You can set an expiration date for the URL
        });

        res.status(200).json({
            url: signedUrl // The URL to access the file
        });
    } catch (err) {
        console.error('Failed to upload file:', err.message);
        res.status(500).json({
            title: '_500_ERROR',
            message: err.message
        });
    }
}

const downloadFile = (req, res) => {
    const filepath = req.query.filepath;

    const bucket = req.app.get('bucket');
    const file = bucket.file(filepath);

    // Check if the file exists
    file.exists((err, exists) => {
        if (err) {
            console.error('Failed to check file existence:', err.message);
            res.status(500).json({ message: 'Internal Server Error' });
        } else if (!exists) {
            res.status(404).json({ message: 'File not found' });
        } else {
            // Determine content type based on file extension
            const ext = path.extname(filepath);
            let contentType;

            switch (ext) {
                case '.pdf':
                    contentType = 'application/pdf';
                    break;
                case '.png':
                    contentType = 'image/png';
                    break;
                case '.jpeg':
                case '.jpg':
                    contentType = 'image/jpeg';
                    break;
                case '.json':
                    contentType = 'application/json'; // Content type for JSON files
                    break;
                // Add more cases for other file types as needed
                default:
                    contentType = 'application/octet-stream'; // Generic binary data
            }

            // Create a read stream from the file and pipe it to the response
            const readStream = file.createReadStream();
            res.setHeader('Content-Type', contentType); // Set the appropriate content type
            readStream.pipe(res);
        }
    });
};


const deleteFile = (req = request, res = response) => {
    const filepath = req.query.filepath;

    const bucket = req.app.get('bucket');
    const file = bucket.file(filepath);

    // Delete the file
    file.delete((err) => {
        if (err) {
            console.error('Failed to delete file:', err.message);
            res.status(500).json({ message: 'Internal Server Error' });
        } else {
            res.status(200).json({ message: 'File deleted successfully' });
        }
    });
}

const uploadMultipleFiles = (req, res) => {
    const files = req.files;
    const filepath = req.query.filepath;

    if (!files) {
        return res.status(400).json({ message: 'No files uploaded' });
    }

    const bucket = req.app.get('bucket');

    // Promise array to handle all uploads
    const uploads = files.map((file, index) => {
        const pathInBucket = `${filepath}/${index}.${file.mimetype.split('/')[1]}`;
        const firebaseFile = bucket.file(pathInBucket);
        return firebaseFile.save(file.buffer);
    });

    // Execute all promises
    Promise.all(uploads)
        .then(() => res.status(200).json({ message: 'Files uploaded successfully' }))
        .catch((err) => {
            console.error('Failed to upload files:', err.message);
            res.status(500).json({ message: 'Internal Server Error' });
        });
};

const getImageUrl = async (req, res) => {
    const imageURL = req.query.url
    try {
        const response = await axios({
            method: 'get',
            url: imageURL,
            responseType: 'stream'
        });

        // Set the appropriate content-type header for the image
        res.setHeader('Content-Type', response.headers['content-type']);

        // Pipe the image stream directly to the client
        console.log('image success')
        response.data.pipe(res);
    } catch (error) {
        console.error('Error downloading the image:', error.message);
        res.status(500).send('Error downloading the image');
    }
}

module.exports = { uploadFile, downloadFile, deleteFile, uploadMultipleFiles, getImageUrl }