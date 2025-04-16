// API endpoints
window.api = {
    baseUrl: 'http://localhost:8080',

    // Products
    async getProducts() {
        try {
            console.log('Fetching products from:', `${this.baseUrl}/product`);
            const response = await fetch(`${this.baseUrl}/product`);
            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Products data:', data);
            if (!response.ok) throw new Error(data.message || 'Failed to fetch products');
            return data;
        } catch (error) {
            console.error('Error in getProducts:', error);
            throw error;
        }
    },

    async getProduct(id) {
        try {
            console.log('Fetching product:', id);
            const response = await fetch(`${this.baseUrl}/product/${id}`);
            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Product data:', data);
            if (!response.ok) throw new Error(data.message || 'Failed to fetch product');
            return data;
        } catch (error) {
            console.error('Error in getProduct:', error);
            throw error;
        }
    },

    // Cart
    async getCart() {
        const response = await fetch(`${this.baseUrl}/cart`, {
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch cart');
        return data;
    },

    async addToCart(productId, quantity) {
        try {
            console.log('Adding to cart:', { productId, quantity });
            const response = await fetch(`${this.baseUrl}/cart/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ productid: productId, quantity })
            });
            console.log('Add to cart response status:', response.status);
            const data = await response.json();
            console.log('Add to cart response data:', data);
            if (!response.ok) throw new Error(data.message || 'Failed to add to cart');
            return data;
        } catch (error) {
            console.error('Error in addToCart:', error);
            throw error;
        }
    },

    async updateCartItem(productId, quantity) {
        const response = await fetch(`${this.baseUrl}/cart/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.token}`
            },
            body: JSON.stringify({ quantity })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to update cart');
        return data;
    },

    async removeFromCart(productId) {
        const response = await fetch(`${this.baseUrl}/cart/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to remove from cart');
        return data;
    },

    // Orders
    async createOrder(orderData) {
        const response = await fetch(`${this.baseUrl}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.token}`
            },
            body: JSON.stringify(orderData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to create order');
        return data;
    },

    async getOrders() {
        const response = await fetch(`${this.baseUrl}/orders`, {
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch orders');
        return data;
    },

    async getAllOrders() {
        try {
            console.log('Fetching all orders...');
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${this.baseUrl}/orders/all`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Orders data:', data);
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch all orders');
            }
            
            // Handle both response formats
            if (Array.isArray(data)) {
                return {
                    success: true,
                    data: data
                };
            }
            
            if (!data.success || !data.data) {
                throw new Error('Invalid response format from server');
            }
            
            return data;
        } catch (error) {
            console.error('Error in getAllOrders:', error);
            throw error;
        }
    }
}; 