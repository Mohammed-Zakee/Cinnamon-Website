const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, restrictTo } = require('../middleware/auth');

// Always use memory storage — works on Vercel & local
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
  }
});

router.post('/', protect, restrictTo('admin'), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });

    // Try to save to disk (local dev). On Vercel this fails silently → fall back to base64.
    const uploadsDir = path.join(__dirname, '../../uploads');
    let imageUrl;

    try {
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      const filename = `${Date.now()}-${req.file.originalname.replace(/\s+/g, '_')}`;
      fs.writeFileSync(path.join(uploadsDir, filename), req.file.buffer);
      imageUrl = `/uploads/${filename}`;
    } catch {
      // Vercel: no disk write → return base64 data URL stored in MongoDB
      const b64 = req.file.buffer.toString('base64');
      imageUrl = `data:${req.file.mimetype};base64,${b64}`;
    }

    res.json({ success: true, imageUrl });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
