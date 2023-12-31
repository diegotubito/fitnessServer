const Router = require('express')
const { uploadFile, deleteFile, uploadMultipleFiles, getImageUrl } = require('./storage_controller')
const router = Router()
const multer = require('multer');
const verifyToken = require('../../Middleware/verify_token');
const { downloadFile } = require('./storage_download_file_controller');
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 }, // 10 MB
});

router.post('/storage', [
    verifyToken,
    upload.single('file')
], uploadFile)

router.post('/storage/multiple', [
    verifyToken,
    upload.array('files', 10)
], uploadMultipleFiles)

router.get('/storage', [verifyToken], downloadFile)
router.get('/storage/imageUrl', getImageUrl)

router.delete('/storage', [verifyToken], deleteFile)

module.exports = router