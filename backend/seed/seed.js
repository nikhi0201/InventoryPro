// backend/seed/seed.js
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');

module.exports = async function seed() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  const exists = await User.findOne({ email: adminEmail });
  if (!exists) {
    const hashed = await bcrypt.hash(process.env.SEED_ADMIN_PASS || 'password', 10);
    await new User({ name: 'Admin', email: adminEmail, password: hashed }).save();
    console.log('Seeded admin user:', adminEmail);
  }
  const countSup = await Supplier.countDocuments();
  if (countSup === 0) {
    const suppliers = [
      { name: 'Acme Co', contactEmail: 'acme@example.com', phone: '+91 9000000001', address: 'Delhi' },
      { name: 'Globex', contactEmail: 'globex@example.com', phone: '+91 9000000002', address: 'Mumbai' },
      { name: 'Stark Ltd', contactEmail: 'stark@example.com', phone: '+91 9000000003', address: 'Bangalore' }
    ];
    await Supplier.insertMany(suppliers);
    console.log('Seeded suppliers');
  }
  const countProd = await Product.countDocuments();
  if (countProd === 0) {
    const suppliers = await Supplier.find().limit(3);
    const products = [];
    for (let i=1;i<=12;i++){
      products.push({
        name: `Sample Product ${i}`,
        sku: `SKU${1000+i}`,
        supplier: suppliers[i % suppliers.length]._id,
        price: Math.round(Math.random()*1000),
        stock: Math.floor(Math.random()*120)
      });
    }
    await Product.insertMany(products);
    console.log('Seeded products');
  }
};
