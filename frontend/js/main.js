// Utility functions
const utils = {
    formatPrice(price) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    },

    showLoading() {
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.classList.add('active');
            console.log('Loading spinner shown');
        } else {
            console.error('Loading element not found');
        }
    },

    hideLoading() {
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.classList.remove('active');
            console.log('Loading spinner hidden');
        } else {
            console.error('Loading element not found');
        }
    },

    showError(message) {
        console.error(message);
        alert(message);
    }
};

// Check authentication for protected routes
const checkAuth = () => {
    const token = localStorage.getItem('token');
    const authButtons = document.getElementById('auth-buttons');
    const logoutBtn = document.getElementById('logout-btn');
    
    if (token) {
        if (authButtons) authButtons.classList.add('hidden');
        if (logoutBtn) logoutBtn.classList.remove('hidden');
    } else {
        if (authButtons) authButtons.classList.remove('hidden');
        if (logoutBtn) logoutBtn.classList.add('hidden');
    }
};

// Handle logout
const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
};

// Load featured products for index page
const loadFeaturedProducts = async () => {
    try {
        utils.showLoading();
        console.log('Fetching featured products...');
        
        const data = await window.api.getProducts();
        console.log('Featured products data:', data);
        
        const featuredProductsContainer = document.getElementById('featured-products');
        if (featuredProductsContainer) {
            if (data && data.length > 0) {
                featuredProductsContainer.innerHTML = data.slice(0, 4).map(product => `
                    <div class="bg-white rounded-lg shadow-md overflow-hidden">
                        <img src="${product.imageurl}" alt="${product.name}" class="w-full h-48 object-cover">
                        <div class="p-4">
                            <h3 class="text-lg font-semibold mb-2">${product.name}</h3>
                            <p class="text-gray-600 mb-2">${product.description.substring(0, 100)}...</p>
                            <p class="text-[#004687] font-bold mb-4">${utils.formatPrice(product.price)}</p>
                            <a href="product.html?id=${product.id}" class="block text-center bg-[#004687] text-white py-2 rounded hover:bg-blue-700">
                                View Details
                            </a>
                        </div>
                    </div>
                `).join('');
            } else {
                featuredProductsContainer.innerHTML = '<p class="text-center text-gray-500">No products available</p>';
            }
        } else {
            console.error('Featured products container not found');
        }
    } catch (error) {
        console.error('Error loading featured products:', error);
        const featuredProductsContainer = document.getElementById('featured-products');
        if (featuredProductsContainer) {
            featuredProductsContainer.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-red-500 mb-4">Failed to load featured products: ${error.message}</p>
                    <a href="products.html" 
                        class="inline-block bg-[#004687] text-white py-2 px-4 rounded hover:bg-blue-700">
                        View All Products
                    </a>
                </div>
            `;
        }
    } finally {
        utils.hideLoading();
    }
};

// Load products if on products page
const loadProducts = async () => {
    try {
        utils.showLoading();
        console.log('Fetching products...');
        
        const data = await window.api.getProducts();
        console.log('Products data:', data);
        
        const productsContainer = document.getElementById('products-container');
        if (productsContainer) {
            if (data && data.length > 0) {
                productsContainer.innerHTML = data.map(product => `
                    <div class="bg-white rounded-lg shadow-md overflow-hidden">
                        <img src="${product.imageurl}" alt="${product.name}" class="w-full h-48 object-cover">
                        <div class="p-4">
                            <h3 class="text-lg font-semibold mb-2">${product.name}</h3>
                            <p class="text-gray-600 mb-2">${product.description}</p>
                            <p class="text-xl font-bold text-[#004687] mb-4">${utils.formatPrice(product.price)}</p>
                            <button onclick="addToCart('${product.id}')" 
                                class="w-full bg-[#004687] text-white py-2 px-4 rounded hover:bg-blue-700">
                                Add to Cart
                            </button>
                        </div>
                    </div>
                `).join('');
            } else {
                productsContainer.innerHTML = '<p class="text-center text-gray-500">No products available</p>';
            }
        } else {
            console.error('Products container not found');
        }
    } catch (error) {
        console.error('Error loading products:', error);
        utils.showError('Failed to load products: ' + error.message);
    } finally {
        utils.hideLoading();
    }
};

// Function to update cart totals without refreshing
const updateCartTotals = async () => {
    try {
        const data = await window.api.getCart();
        if (data.success && data.data && data.data.length > 0) {
            // Calculate totals
            const subtotal = data.data.reduce((sum, item) => sum + (item.products.price * item.quantity), 0);
            const tax = subtotal * 0.1; // 10% tax
            const total = subtotal + tax;
            
            // Update the totals in the UI
            const subtotalElement = document.getElementById('cart-subtotal');
            const taxElement = document.getElementById('cart-tax');
            const totalElement = document.getElementById('cart-total');
            
            if (subtotalElement) subtotalElement.textContent = utils.formatPrice(subtotal);
            if (taxElement) taxElement.textContent = utils.formatPrice(tax);
            if (totalElement) totalElement.textContent = utils.formatPrice(total);
        }
    } catch (error) {
        console.error('Error updating cart totals:', error);
    }
};

// Load cart if on cart page
const loadCart = async () => {
    try {
        utils.showLoading();
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }
        
        console.log('Fetching cart...');
        
        const data = await window.api.getCart();
        console.log('Cart data:', data);
        
        const cartContainer = document.getElementById('cart-container');
        if (cartContainer) {
            if (data.success && data.data && data.data.length > 0) {
                // Calculate totals
                const subtotal = data.data.reduce((sum, item) => sum + (item.products.price * item.quantity), 0);
                const tax = subtotal * 0.1; // 10% tax
                const total = subtotal + tax;
                
                cartContainer.innerHTML = `
                    <div class="space-y-4">
                        ${data.data.map(item => `
                            <div class="flex items-center justify-between bg-white p-4 rounded-lg shadow" data-product-id="${item.id}">
                                <div class="flex items-center space-x-4">
                                    <img src="${item.products.imageurl}" 
                                        alt="${item.products.name}" 
                                        class="w-20 h-20 object-cover rounded">
                                    <div>
                                        <h3 class="font-semibold">${item.products.name}</h3>
                                        <p class="text-[#004687]">${utils.formatPrice(item.products.price)}</p>
                                        <p class="item-total text-sm text-gray-600">${utils.formatPrice(item.products.price * item.quantity)}</p>
                                    </div>
                                </div>
                                <div class="flex items-center space-x-4">
                                    <div class="flex items-center space-x-2">
                                        <button class="decrease-btn px-2 py-1 border rounded" onclick="updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                                        <span class="quantity-value">${item.quantity}</span>
                                        <button class="increase-btn px-2 py-1 border rounded" onclick="updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                                    </div>
                                    <button onclick="removeFromCart('${item.id}')"
                                        class="text-red-500 hover:text-red-700">
                                        Remove
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                        <div class="bg-white p-4 rounded-lg shadow mt-4">
                            <div class="flex justify-between mb-2">
                                <span>Subtotal:</span>
                                <span id="cart-subtotal">${utils.formatPrice(subtotal)}</span>
                            </div>
                            <div class="flex justify-between mb-2">
                                <span>Tax:</span>
                                <span id="cart-tax">${utils.formatPrice(tax)}</span>
                            </div>
                            <div class="flex justify-between font-bold">
                                <span>Total:</span>
                                <span id="cart-total">${utils.formatPrice(total)}</span>
                            </div>
                            <button onclick="window.location.href='checkout.html'"
                                class="w-full mt-4 bg-[#004687] text-white py-2 px-4 rounded hover:bg-blue-700">
                                Proceed to Checkout
                            </button>
                        </div>
                    </div>
                `;
            } else {
                cartContainer.innerHTML = `
                    <div class="text-center py-8">
                        <p class="text-gray-500 mb-4">Your cart is empty</p>
                        <a href="products.html" 
                            class="inline-block bg-[#004687] text-white py-2 px-4 rounded hover:bg-blue-700">
                            Continue Shopping
                        </a>
                    </div>
                `;
            }
        } else {
            console.error('Cart container not found');
        }
    } catch (error) {
        console.error('Error loading cart:', error);
        utils.showError('Failed to load cart: ' + error.message);
    } finally {
        utils.hideLoading();
    }
};

// Load product details if on product page
const loadProductDetails = async () => {
    try {
        utils.showLoading();
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        
        if (!productId) {
            window.location.href = 'products.html';
            return;
        }
        
        console.log('Fetching product details for ID:', productId);
        
        const data = await window.api.getProduct(productId);
        console.log('Product details data:', data);
        
        const productContainer = document.getElementById('product-container');
        if (productContainer) {
            productContainer.innerHTML = `
                <div class="bg-white rounded-lg shadow-md overflow-hidden">
                    <div class="md:flex">
                        <div class="md:w-1/2">
                            <img src="${data.imageurl}" alt="${data.name}" class="w-full h-96 object-cover">
                        </div>
                        <div class="p-6 md:w-1/2">
                            <h1 class="text-2xl font-bold mb-2">${data.name}</h1>
                            <p class="text-gray-600 mb-4">${data.description}</p>
                            <div class="mb-4">
                                <p class="text-2xl font-bold text-[#004687]">${utils.formatPrice(data.price)}</p>
                                <p class="text-sm text-gray-500 mt-1">Stock: ${data.stock} units</p>
                                <p class="text-sm text-gray-500">Category: ${data.category}</p>
                            </div>
                            
                            <div class="flex items-center mb-6">
                                <label for="quantity" class="mr-2">Quantity:</label>
                                <select id="quantity" class="border rounded px-2 py-1">
                                    ${Array.from({length: Math.min(5, data.stock)}, (_, i) => i + 1)
                                        .map(num => `<option value="${num}">${num}</option>`).join('')}
                                </select>
                            </div>
                            
                            <button onclick="addToCart('${data.id}')" 
                                class="w-full bg-[#004687] text-white py-3 px-4 rounded hover:bg-blue-700">
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            `;
        } else {
            console.error('Product container not found');
        }
    } catch (error) {
        console.error('Error loading product details:', error);
        const productContainer = document.getElementById('product-container');
        if (productContainer) {
            productContainer.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-red-500 mb-4">Failed to load product details: ${error.message}</p>
                    <a href="products.html" 
                        class="inline-block bg-[#004687] text-white py-2 px-4 rounded hover:bg-blue-700">
                        Back to Products
                    </a>
                </div>
            `;
        }
    } finally {
        utils.hideLoading();
    }
};

// Cart functions
const addToCart = async (productId) => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        utils.showLoading();
        const quantity = document.getElementById('quantity') ? parseInt(document.getElementById('quantity').value) : 1;
        
        console.log('Adding to cart:', { productId, quantity });
        
        const data = await window.api.addToCart(productId, quantity);
        console.log('Add to cart response:', data);
        
        if (data.success) {
            alert('Product added to cart!');
        } else {
            throw new Error(data.error || 'Failed to add to cart');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        utils.showError('Failed to add to cart: ' + error.message);
    } finally {
        utils.hideLoading();
    }
};

const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return;

    try {
        utils.showLoading();
        const token = localStorage.getItem('token');
        
        console.log('Updating quantity:', { productId, quantity });
        
        const data = await window.api.updateCartItem(productId, quantity);
        console.log('Update quantity response:', data);
        
        if (data.success) {
            // Update the UI without refreshing the page
            const quantityElement = document.querySelector(`[data-product-id="${productId}"] .quantity-value`);
            if (quantityElement) {
                quantityElement.textContent = quantity;
            }
            
            // Update the item total
            const itemTotalElement = document.querySelector(`[data-product-id="${productId}"] .item-total`);
            if (itemTotalElement && data.data) {
                const itemTotal = data.data.products.price * quantity;
                itemTotalElement.textContent = utils.formatPrice(itemTotal);
            }
            
            // Update the cart totals
            updateCartTotals();
            
            // Update the buttons to reflect the new quantity
            const decreaseBtn = document.querySelector(`[data-product-id="${productId}"] .decrease-btn`);
            const increaseBtn = document.querySelector(`[data-product-id="${productId}"] .increase-btn`);
            
            if (decreaseBtn) {
                decreaseBtn.onclick = () => updateQuantity(productId, quantity - 1);
            }
            
            if (increaseBtn) {
                increaseBtn.onclick = () => updateQuantity(productId, quantity + 1);
            }
        } else {
            throw new Error(data.error || 'Failed to update cart');
        }
    } catch (error) {
        console.error('Error updating quantity:', error);
        utils.showError('Failed to update quantity: ' + error.message);
    } finally {
        utils.hideLoading();
    }
};

const removeFromCart = async (productId) => {
    try {
        utils.showLoading();
        const token = localStorage.getItem('token');
        
        console.log('Removing from cart:', productId);
        
        const data = await window.api.removeFromCart(productId);
        console.log('Remove from cart response:', data);
        
        if (data.success) {
            // Remove the item from the UI without refreshing
            const itemElement = document.querySelector(`[data-product-id="${productId}"]`);
            if (itemElement) {
                itemElement.remove();
            }
            
            // Update the cart totals
            updateCartTotals();
            
            // Check if cart is empty
            const cartContainer = document.getElementById('cart-container');
            if (cartContainer && cartContainer.querySelectorAll('[data-product-id]').length === 0) {
                cartContainer.innerHTML = `
                    <div class="text-center py-8">
                        <p class="text-gray-500 mb-4">Your cart is empty</p>
                        <a href="products.html" 
                            class="inline-block bg-[#004687] text-white py-2 px-4 rounded hover:bg-blue-700">
                            Continue Shopping
                        </a>
                    </div>
                `;
            }
        } else {
            throw new Error(data.error || 'Failed to remove from cart');
        }
    } catch (error) {
        console.error('Error removing from cart:', error);
        utils.showError('Failed to remove from cart: ' + error.message);
    } finally {
        utils.hideLoading();
    }
};

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing page...');
    checkAuth();
    
    // Add logout event listener
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Load content based on current page
    const currentPage = window.location.pathname;
    console.log('Current page:', currentPage);
    
    // Extract the filename from the path
    const pageName = currentPage.split('/').pop();
    console.log('Page name:', pageName);
    
    if (pageName === 'index.html' || pageName === '') {
        console.log('Loading featured products...');
        loadFeaturedProducts();
    } else if (pageName === 'products.html') {
        console.log('Loading products...');
        loadProducts();
    } else if (pageName === 'cart.html') {
        console.log('Loading cart...');
        loadCart();
    } else if (pageName === 'product.html') {
        console.log('Loading product details...');
        loadProductDetails();
    }
}); 