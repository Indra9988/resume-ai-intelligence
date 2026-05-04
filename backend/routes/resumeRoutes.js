const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  uploadResume,
  getAllResumes,
  getResumeById,
  deleteResume,
  mlHealth,
  getStats,
} = require('../controllers/resumeController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, require('os').tmpdir()),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.docx', '.doc', '.txt'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Only PDF, DOCX, DOC, TXT files allowed'));
  },
});

router.post('/upload',   upload.single('resume'), uploadResume);
router.post('/analyze',  uploadResume);           // text-only (no file)
router.get('/',          getAllResumes);
router.get('/stats',     getStats);
router.get('/ml-health', mlHealth);
router.get('/:id',       getResumeById);
router.delete('/:id',    deleteResume);

module.exports = router;
