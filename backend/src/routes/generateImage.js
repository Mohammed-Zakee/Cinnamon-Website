const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, restrictTo } = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files allowed'), false);
    }
    cb(null, true);
  }
});

/**
 * POST /api/generate-image
 * Body: multipart/form-data  { image: File, style?: string }
 * Returns: { success: true, originalUrl: string, generatedUrl: string }
 *
 * Requires GEMINI_API_KEY in environment variables.
 * Get a free key at: https://aistudio.google.com/app/apikey
 */
router.post('/', protect, restrictTo('admin'), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file uploaded' });
    }

    // Return the original as base64 regardless
    const originalB64 = req.file.buffer.toString('base64');
    const originalUrl = `data:${req.file.mimetype};base64,${originalB64}`;

    // Check for API key
    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        success: true,
        originalUrl,
        generatedUrl: null,
        message: 'GEMINI_API_KEY not set — add it to your environment variables to enable AI generation. For now, use the original image.'
      });
    }

    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-preview-image-generation',
      generationConfig: {
        responseModalities: ['image', 'text'],
      }
    });

    const style = req.body.style || 'dark amber luxury';

    const prompt = `You are a professional product photographer for a premium spice brand called Ceylone Zimt.

Take the uploaded cinnamon product image and create a stunning product photograph with this style: "${style}".

Requirements:
- Place the product on a very dark, deep brown background (#0D0800 to #130C00)
- Add warm amber and golden bokeh lighting effects in the background
- Illuminate the product with dramatic warm side lighting that highlights its natural textures
- Add a very subtle surface reflection below the product
- Keep the product centered and perfectly sharp
- The overall mood should be premium, luxurious, and warm
- Style: professional e-commerce product photo, dark mode aesthetic

Keep the product exactly as it is — only change the background and lighting.`;

    const imageData = {
      inlineData: {
        data: originalB64,
        mimeType: req.file.mimetype
      }
    };

    const result = await model.generateContent([prompt, imageData]);
    const response = result.response;

    // Extract the generated image from the response
    let generatedUrl = null;
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        generatedUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!generatedUrl) {
      return res.json({
        success: true,
        originalUrl,
        generatedUrl: null,
        message: 'AI generation returned no image. Try again or use the original.'
      });
    }

    res.json({ success: true, originalUrl, generatedUrl });

  } catch (err) {
    console.error('Generate image error:', err.message);
    res.status(500).json({
      success: false,
      error: err.message,
      hint: 'Make sure GEMINI_API_KEY is set and the gemini-2.0-flash-preview-image-generation model is available in your region.'
    });
  }
});

module.exports = router;
