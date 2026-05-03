const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  grade: { type: String, required: true },
  category: { type: String, enum: ['quill', 'oil', 'pieces', 'powder'], default: 'quill' },
  description: { type: String, required: true },
  longDescription: { type: String },
  price: { type: Number, required: true, min: 0 },
  prices: {
    USD: { type: Number, default: 0 },
    EUR: { type: Number, default: 0 },
    PLN: { type: Number, default: 0 },
    LKR: { type: Number, default: 0 }
  },
  isActive: { type: Boolean, default: true },
  gallery: [{ type: String }],
  unit: { type: String, default: '100g' },
  emoji: { type: String, default: '🌿' },
  imageUrl: { type: String, default: null },
  colorFrom: { type: String, default: '#8B3A0F' },
  colorTo: { type: String, default: '#3D1A05' },
  badge: { type: String },  // 'FINEST', 'RARE', etc.
  inStock: { type: Boolean, default: true },
  stockQty: { type: Number, default: 100 },
  featured: { type: Boolean, default: false },
  rating: { type: Number, default: 4.8, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  benefits: [String],
  origin: { type: String, default: 'Sri Lanka' },
  certifications: [String],
}, { timestamps: true });

// Virtual for formatted price
productSchema.virtual('formattedPrice').get(function () {
  return `$${this.price.toFixed(2)}`;
});

productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
