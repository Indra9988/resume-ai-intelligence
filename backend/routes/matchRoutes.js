const express = require('express');
const router = express.Router();
const { matchResumeToJob, batchMatch } = require('../controllers/matchController');

router.post('/single', matchResumeToJob);
router.post('/batch',  batchMatch);

module.exports = router;
