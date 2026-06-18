const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware Configuration
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

// Mock Database Storage Arrays
let products = [
  { id: 1, name: "Premium Jet Black Tee", category: "Classic T-Shirts", price: 1250, stock: 45, sold: 12, description: "Minimalist layout combed organic cotton profile.", color: "#141414", accent: "Premium", imageUrl: "" },
  { id: 2, name: "Oversized Sand Drop Shoulder", category: "Drop Shoulder", price: 1450, stock: 8, sold: 24, description: "Heavyweight drop capsule variant.", color: "#d6c5b3", accent: "Limited", imageUrl: "" },
  { id: 3, name: "Classic Royal Panjabi", category: "Panjabi", price: 3200, stock: 20, sold: 5, description: "Luxury thread counts finished with pristine geometric details.", color: "#1a2a3a", accent: "Heritage", imageUrl: "" }
];

let orders = [
  {
    id: 1001,
    name: "Rahat Khan",
    phone: "01712345678",
    address: "House 24, Road 4, Dhanmondi",
    thana: "Dhanmondi",
    items: [{ name: "Premium Jet Black Tee", qty: 2, price: 1250 }],
    total: 2500,
    status: "Pending"
  }
];

// Counter tracking system
let nextProductId = 4;
let nextOrderId = 1002;

// ==========================================
// 1. PRODUCTS COMPONENT PIPELINES
// ==========================================

app.get('/api/products', (req, res) => {
  res.status(200).json(products);
});

app.post('/api/products', (req, res) => {
  const { name, category, price, stock, description, imageUrl } = req.body;
  
  if (!name || !price || stock === undefined) {
    return res.status(400).json({ error: "Missing required catalog fields." });
  }

  const newProduct = {
    id: nextProductId++,
    name,
    category: category || "Classic T-Shirts",
    price: Number(price),
    stock: Number(stock),
    sold: 0,
    description: description || "",
    imageUrl: imageUrl || "", 
    color: "#222222",
    accent: "New Drop"
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

app.patch('/api/products/:id/stock', (req, res) => {
  const prodId = Number(req.params.id);
  const { amount } = req.body;

  const product = products.find(p => p.id === prodId);
  if (!product) {
    return res.status(404).json({ error: "Product item matrix not found." });
  }

  product.stock = Math.max(0, product.stock + Number(amount));
  res.status(200).json(product);
});

app.delete('/api/products/:id', (req, res) => {
  const prodId = Number(req.params.id);
  const index = products.findIndex(p => p.id === prodId);

  if (index !== -1) {
    products.splice(index, 1);
    return res.status(200).json({ success: true, message: "Product entry wiped safely." });
  }
  res.status(404).json({ error: "Product item targeted for removal not found." });
});

// ==========================================
// 2. ORDERS & CHECKOUT MANAGEMENT ENDPOINTS
// ==========================================

app.get('/api/orders', (req, res) => {
  res.status(200).json(orders);
});

app.post('/api/checkout', (req, res) => {
  const { name, phone, address, thana, items } = req.body;

  if (!name || !phone || !address || !thana || !items || items.length === 0) {
    return res.status(400).json({ error: "Incomplete shipping or cart allocation data." });
  }

  let computedTotal = 0;
  
  items.forEach(cartItem => {
    computedTotal += (cartItem.price * cartItem.qty);
    const storeProduct = products.find(p => p.id === cartItem.id);
    if (storeProduct) {
      storeProduct.stock = Math.max(0, storeProduct.stock - cartItem.qty);
      storeProduct.sold = (storeProduct.sold || 0) + cartItem.qty;
    }
  });

  const newOrder = {
    id: nextOrderId++,
    name,
    phone,
    address,
    thana,
    items: items.map(i => ({ name: i.name, qty: i.qty, price: i.price })),
    total: computedTotal,
    status: "Pending"
  };

  orders.push(newOrder);
  res.status(201).json(newOrder);
});

app.put('/api/orders/:id', (req, res) => {
  const orderId = Number(req.params.id);
  const { name, phone, address, thana, items, total } = req.body;

  const order = orders.find(o => o.id === orderId);
  if (!order) {
    return res.status(404).json({ error: "Target invoice order assignment missing." });
  }

  order.name = name || order.name;
  order.phone = phone || order.phone;
  order.address = address || order.address;
  order.thana = thana || order.thana;
  order.items = items || order.items;
  order.total = total !== undefined ? Number(total) : order.total;

  res.status(200).json(order);
});

app.patch('/api/orders/:id/status', (req, res) => {
  const orderId = Number(req.params.id);
  const order = orders.find(o => o.id === orderId);

  if (!order) {
    return res.status(404).json({ error: "Target invoice dataset not found." });
  }

  if (order.status === "Pending") {
    order.status = "Processing";
  } else if (order.status === "Processing") {
    order.status = "Shipped";
  } else {
    order.status = "Pending";
  }

  res.status(200).json(order);
});

app.delete('/api/orders/:id', (req, res) => {
  const orderId = Number(req.params.id);
  const orderIndex = orders.findIndex(o => o.id === orderId);

  if (orderIndex !== -1) {
    orders.splice(orderIndex, 1);
    return res.status(200).json({ success: true, message: "Order removed safely from server database." });
  } else {
    return res.status(404).json({ error: "Targeted order entry not found." });
  }
});

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(` Ƶ ZERÉN ENGINE PIPELINE ONLINE ON PORT: ${PORT} `);
  console.log(` API Endpoint: http://localhost:${PORT}/api      `);
  console.log(`=================================================`);
});