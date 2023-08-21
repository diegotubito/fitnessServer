const Router = require('express')
const { uploadFile, downloadFile, deleteFile } = require('./storage_controller')
const router = Router()
const multer = require('multer');
const verifyToken = require('../../Middleware/verify_token');
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 5 MB
});

router.post('/storage', [
    verifyToken,
    upload.single('file')
], uploadFile)

router.get('/storage', [verifyToken], downloadFile)
router.delete('/storage', [verifyToken], deleteFile)

module.exports = router