const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory storage for products
let products = [];
let nextId = 1;

// Routes

// Get all products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// Add a new product
app.post('/api/products', (req, res) => {
  const { name, price } = req.body;

  // Validation
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Product name is required and must be a string' });
  }

  if (price === undefined || price === null) {
    return res.status(400).json({ error: 'Price is required' });
  }

  const priceNum = parseFloat(price);
  if (isNaN(priceNum) || priceNum < 0) {
    return res.status(400).json({ error: 'Price must be a valid non-negative number' });
  }

  const newProduct = {
    id: nextId++,
    name: name.trim(),
    price: priceNum
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

// Delete a product
app.delete('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = products.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const deleted = products.splice(index, 1);
  res.json(deleted[0]);
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Product Entry App is running on http://localhost:${PORT}`);
});
