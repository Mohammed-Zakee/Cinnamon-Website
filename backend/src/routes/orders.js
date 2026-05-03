const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/orderController');
const { protect, optionalAuth, restrictTo } = require('../middleware/auth');

router.post('/', optionalAuth, ctrl.createOrder);
router.post('/create-checkout-session', ctrl.createCheckoutSession);
router.get('/my', protect, ctrl.getMyOrders);
router.get('/stats', protect, restrictTo('admin'), ctrl.getOrderStats);
router.get('/', protect, restrictTo('admin'), ctrl.getOrders);
router.get('/:id', ctrl.getOrder);
router.patch('/:id/status', protect, restrictTo('admin'), ctrl.updateOrderStatus);

module.exports = router;
