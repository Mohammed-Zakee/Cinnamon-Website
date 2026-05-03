const Order = require('../models/Order');
const Product = require('../models/Product');

// POST /api/orders — Create order (guest or logged in)
exports.createOrder = async (req, res) => {
  try {
    const { items, shipping, paymentMethod = 'card', notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Order must have at least one item' });
    }

    // Validate and get product prices from DB
    let subtotal = 0;
    const enrichedItems = [];
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ success: false, error: `Product ${item.productId} not found` });
      if (!product.inStock) return res.status(400).json({ success: false, error: `${product.name} is out of stock` });
      const lineTotal = product.price * item.qty;
      subtotal += lineTotal;
      enrichedItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        qty: item.qty,
        unit: product.unit,
        emoji: product.emoji
      });
    }

    // Shipping cost logic (free over $50)
    const shippingCost = subtotal >= 50 ? 0 : 8.99;
    const tax = +(subtotal * 0.0).toFixed(2); // no tax for international, adjust as needed
    const total = +(subtotal + shippingCost + tax).toFixed(2);

    const order = await Order.create({
      user: req.user?._id,
      items: enrichedItems,
      shipping,
      subtotal: +subtotal.toFixed(2),
      shippingCost,
      tax,
      total,
      paymentMethod,
      notes
    });

    // Update stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stockQty: -item.qty } });
    }

    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// GET /api/orders — Get all orders (admin)
exports.getOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).populate('user', 'firstName lastName email'),
      Order.countDocuments(filter)
    ]);
    res.json({ success: true, orders, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/orders/:id
exports.getOrder = async (req, res) => {
  try {
    const query = req.params.id.length > 10 && !req.params.id.includes('-')
      ? { _id: req.params.id }
      : { orderNumber: req.params.id };
    const order = await Order.findOne(query).populate('items.product', 'name emoji');
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// PATCH /api/orders/:id/status (admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;
    const update = { status };
    if (trackingNumber) update.trackingNumber = trackingNumber;
    if (status === 'shipped') update.shippedAt = new Date();
    if (status === 'delivered') update.deliveredAt = new Date();

    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/orders/my — Get logged-in user's orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/orders/stats (admin)
exports.getOrderStats = async (req, res) => {
  try {
    const [totalOrders, totalRevenue, pending, delivered] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'delivered' })
    ]);
    res.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        pending,
        delivered
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// POST /api/orders/create-checkout-session
exports.createCheckoutSession = async (req, res) => {
  try {
    const { items, currency = 'usd', successUrl, cancelUrl } = req.body;
    
    const line_items = await Promise.all(items.map(async item => {
      const product = await Product.findById(item.productId);
      if (!product) throw new Error('Product not found');
      // For simplistic conversion from base USD to target currency, we apply the rate here or rely on Stripe.
      // Easiest is to receive price exactly in target currency from the frontend.
      return {
        price_data: {
          currency: currency.toLowerCase(),
          product_data: { name: product.name },
          unit_amount: Math.round(item.unit_amount * 100), // in cents
        },
        quantity: item.qty
      };
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    res.json({ id: session.id, url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
