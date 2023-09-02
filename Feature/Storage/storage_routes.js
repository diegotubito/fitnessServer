const Router = require('express')
const { uploadFile, downloadFile, deleteFile, uploadMultipleFiles, getImageUrl } = require('./storage_controller')
const router = Router()
const multer = require('multer');
const verifyToken = require('../../Middleware/verify_token');
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
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