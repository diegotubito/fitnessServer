const { request, response } = require("express");
const path = require('path');
const getFileExtension = (filepath) => path.extname(filepath);

const getContentType = (extension) => {
  const contentTypes = {
    '.pdf': 'application/pdf',
    '.png': 'image/png',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.json': 'application/json',
  };
  return contentTypes[extension] || 'application/octet-stream';
};

const checkFileExistence = async (file) => {
  try {
    const [exists] = await file.exists();
    return exists;
  } catch (err) {
    throw new Error('Failed to check file existence');
  }
};

const downloadFile = async (req, res) => {
  try {
    const filepath = req.query.filepath;
    const bucket = req.app.get('bucket');
    const file = bucket.file(filepath);

    const fileExists = await checkFileExistence(file);
    if (!fileExists) {
      return res.status(404).json({ message: 'File not found' });
    }

    const extension = getFileExtension(filepath);
    const contentType = getContentType(extension);

    const readStream = file.createReadStream();
    res.setHeader('Content-Type', contentType);
    readStream.pipe(res);

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = { downloadFile }