const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();
    if (req.body.logoUrl !== undefined) settings.logoUrl = req.body.logoUrl;
    if (req.body.slideShows !== undefined) settings.slideShows = req.body.slideShows;
    if (req.body.totalViews !== undefined) settings.totalViews = req.body.totalViews;
    await settings.save();
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/track-view', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    settings.totalViews = (settings.totalViews || 0) + 1;
    await settings.save();
    res.json({ success: true, totalViews: settings.totalViews });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
