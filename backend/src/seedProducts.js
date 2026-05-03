const Product = require('./models/Product');

const products = [
  {
    name: 'Alba',
    slug: 'alba',
    grade: 'Extra Exquisite',
    category: 'quill',
    description: 'The crown jewel — paper-thin quills with a delicate sweet aroma and the world\'s lowest coumarin content.',
    longDescription: 'Alba is the rarest and most prized grade of Ceylon cinnamon. Its extraordinarily thin quills are hand-rolled by master craftsmen and exhibit an unparalleled delicate sweetness. With the lowest coumarin content of any cinnamon variety, Alba is prized by health-conscious chefs and wellness practitioners worldwide.',
    price: 42.00,
    unit: '100g',
    emoji: '🌿',
    colorFrom: '#8B3A0F',
    colorTo: '#3D1A05',
    badge: 'FINEST',
    featured: true,
    stockQty: 150,
    rating: 4.9,
    reviewCount: 128,
    benefits: ['Lowest coumarin content', 'Delicate sweet aroma', 'Perfect for desserts', 'Anti-inflammatory properties'],
    certifications: ['Organic', 'Fair Trade', 'ISO 22000']
  },
  {
    name: 'C5 Special',
    slug: 'c5-special',
    grade: 'Special',
    category: 'quill',
    description: 'Premium handcrafted 5-layer quills with rich warm spice notes, perfect for gourmet cooking and aromatic teas.',
    longDescription: 'C5 Special represents the elite of Ceylon cinnamon grades. These carefully rolled 5-layer quills are selected for their superior aroma, vibrant color, and perfectly balanced spice profile. A favorite among Michelin-starred chefs.',
    price: 28.00,
    unit: '100g',
    emoji: '🫙',
    colorFrom: '#C1440E',
    colorTo: '#6B2308',
    featured: true,
    stockQty: 200,
    rating: 4.8,
    reviewCount: 94,
    benefits: ['5-layer handcrafted quills', 'Rich warm spice notes', 'Perfect for teas', 'Balances blood sugar'],
    certifications: ['Organic', 'Fair Trade']
  },
  {
    name: 'C5',
    slug: 'c5',
    grade: 'Superior',
    category: 'quill',
    description: 'Versatile, high-quality cinnamon with a balanced flavor profile — ideal for everyday culinary and wellness use.',
    longDescription: 'The C5 grade strikes the perfect balance between quality and value. With its well-rounded, balanced flavor profile, it\'s the everyday hero for home cooks, professional chefs, and wellness applications alike.',
    price: 22.00,
    unit: '100g',
    emoji: '🌰',
    colorFrom: '#A0330A',
    colorTo: '#4D1A05',
    stockQty: 300,
    rating: 4.7,
    reviewCount: 76,
    benefits: ['Balanced flavor profile', 'Everyday culinary use', 'Blood sugar support', 'Antioxidant rich'],
    certifications: ['Organic']
  },
  {
    name: 'C4',
    slug: 'c4',
    grade: 'Premium',
    category: 'quill',
    description: 'Robust 4-layer quills with strong classic Ceylon character. Loved by professional chefs and spice enthusiasts.',
    longDescription: 'C4 grade cinnamon offers the bold, unmistakably deep flavor of true Ceylon cinnamon. These robust 4-layer quills are a staple in professional kitchens around the world, bringing a powerful warmth to any dish.',
    price: 18.00,
    unit: '100g',
    emoji: '🍵',
    colorFrom: '#7A2A08',
    colorTo: '#3D1200',
    stockQty: 250,
    rating: 4.6,
    reviewCount: 52,
    benefits: ['Strong Ceylon character', '4-layer quills', 'Professional kitchen favorite', 'Rich warm depth'],
    certifications: ['Organic']
  },
  {
    name: 'Cinnamon Bark Oil',
    slug: 'cinnamon-bark-oil',
    grade: 'Pure Essential Oil',
    category: 'oil',
    description: 'Steam-distilled pure essential oil with intensely warm spicy scent. Prized in aromatherapy and cosmetics.',
    longDescription: 'Our Cinnamon Bark Oil is steam-distilled from premium Ceylon cinnamon bark, capturing its most potent and aromatic compounds. Just a few drops fill any space with warmth and spice. Used in luxury aromatherapy, natural cosmetics, and artisan perfumery.',
    price: 65.00,
    unit: '10ml',
    emoji: '💧',
    colorFrom: '#C9A84C',
    colorTo: '#3D1B05',
    badge: 'RARE',
    featured: true,
    stockQty: 80,
    rating: 4.9,
    reviewCount: 63,
    benefits: ['100% pure steam-distilled', 'Aromatherapy grade', 'Antimicrobial properties', 'Luxury cosmetics use'],
    certifications: ['Organic', 'GMP Certified']
  },
  {
    name: 'Cinnamon Quillings',
    slug: 'cinnamon-quillings',
    grade: 'Quillings',
    category: 'pieces',
    description: 'Small, curled off-cuts from premium quill production — intensely flavored and perfect for infusions, teas, and cooking.',
    longDescription: 'Cinnamon Quillings are the curled inner bark off-cuts from premium quill rolling. These pieces are densely packed with essential oils and carry an intense cinnamon flavor, making them ideal for infusions, mulled wine, artisan teas, and slow-cooked dishes.',
    price: 14.00,
    unit: '100g',
    emoji: '🪵',
    colorFrom: '#B06020',
    colorTo: '#5A2A08',
    stockQty: 400,
    rating: 4.5,
    reviewCount: 41,
    benefits: ['Intense cinnamon flavor', 'Perfect for infusions', 'Economical choice', 'Great for mulled drinks'],
    certifications: ['Organic']
  }
];

module.exports = async function seedProducts() {
  try {
    await Product.insertMany(products);
    console.log('🌿 Products seeded successfully!');
  } catch (err) {
    console.error('Seed error:', err.message);
  }
};
