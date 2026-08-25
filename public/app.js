// API Base URL
const API_BASE = '/api';

// DOM Elements
const form = document.getElementById('productForm');
const productNameInput = document.getElementById('productName');
const productPriceInput = document.getElementById('productPrice');
const productsList = document.getElementById('productsList');
const messageDiv = document.getElementById('message');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  form.addEventListener('submit', handleFormSubmit);
});

/**
 * Load and display all products
 */
async function loadProducts() {
  try {
    const response = await fetch(`${API_BASE}/products`);
    const products = await response.json();

    if (products.length === 0) {
      productsList.innerHTML = '<p class="no-products">No products yet. Add one to get started!</p>';
    } else {
      productsList.innerHTML = products
        .map(product => createProductCard(product))
        .join('');

      // Attach delete event listeners
      document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => deleteProduct(e.target.dataset.id));
      });
    }
  } catch (error) {
    console.error('Error loading products:', error);
    showMessage('Failed to load products', 'error');
  }
}

/**
 * Handle form submission
 */
async function handleFormSubmit(e) {
  e.preventDefault();

  const name = productNameInput.value.trim();
  const price = productPriceInput.value;

  if (!name || !price) {
    showMessage('Please fill in all fields', 'error');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, price: parseFloat(price) }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add product');
    }

    const product = await response.json();
    showMessage(`Product "${product.name}" added successfully!`, 'success');
    
    // Reset form
    form.reset();
    productNameInput.focus();

    // Reload products
    loadProducts();
  } catch (error) {
    console.error('Error adding product:', error);
    showMessage(error.message, 'error');
  }
}

/**
 * Delete a product
 */
async function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete product');
    }

    showMessage('Product deleted successfully', 'success');
    loadProducts();
  } catch (error) {
    console.error('Error deleting product:', error);
    showMessage(error.message, 'error');
  }
}

/**
 * Create HTML for a product card
 */
function createProductCard(product) {
  return `
    <div class="product-card">
      <div class="product-info">
        <h3>${escapeHtml(product.name)}</h3>
        <p>ID: ${product.id}</p>
      </div>
      <div style="display: flex; align-items: center; gap: 20px; width: 100%; justify-content: flex-end;">
        <div class="product-price">$${product.price.toFixed(2)}</div>
        <div class="product-actions">
          <button class="btn btn-danger btn-delete" data-id="${product.id}">Delete</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Show a message to the user
 */
function showMessage(text, type) {
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;

  // Auto-hide after 3 seconds
  setTimeout(() => {
    messageDiv.className = 'message';
  }, 3000);
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
