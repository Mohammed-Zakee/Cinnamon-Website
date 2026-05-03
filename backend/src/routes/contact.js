const express = require('express');
const router = express.Router();

// POST /api/contact
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'Name, email, and message are required' });
    }
    // In production, send email via nodemailer here
    console.log('📬 Contact form submission:', { name, email, subject, message });
    res.json({ success: true, message: 'Thank you! We will get back to you within 24 hours.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
