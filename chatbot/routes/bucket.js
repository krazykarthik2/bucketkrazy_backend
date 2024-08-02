const express = require('express');
const router = express.Router();
const bucketController = require('../controllers/bucketController');

router.post('/create', bucketController.createBucket);
router.post('/addMessage', bucketController.addMessage);
router.delete('/delete/:id', bucketController.deleteBucket);
router.get('/discover/:bucketName', bucketController.discoverBucket);
router.post('/join', bucketController.joinBucket);
router.post('/approve', bucketController.approveMember);

module.exports = router;
