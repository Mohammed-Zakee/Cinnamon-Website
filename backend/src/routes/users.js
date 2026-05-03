const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/auth');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.get('/me', protect, ctrl.getMe);
router.put('/me', protect, ctrl.updateMe);
router.patch('/password', protect, ctrl.changePassword);
router.get('/', protect, restrictTo('admin'), ctrl.getUsers);

module.exports = router;
