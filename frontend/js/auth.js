// Auth state management
const auth = {
    token: localStorage.getItem('token'),
    user: null,

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.token;
    },

    // Check if user is admin
    isAdmin() {
        return this.user?.role === 'admin';
    },

    // Set token and update localStorage
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    },

    // Set user data
    setUser(user) {
        this.user = user;
    },

    // Clear auth data
    clear() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
    },

    // Update UI based on auth state
    updateUI() {
        const adminProductsLink = document.getElementById('admin-products-link');
        const adminOrdersLink = document.getElementById('admin-orders-link');
        const authButtons = document.getElementById('auth-buttons');
        const logoutButton = document.getElementById('logout-btn');
        const welcomeMessage = document.getElementById('welcome-message');

        if (this.isAuthenticated()) {
            if (this.isAdmin()) {
                if (adminProductsLink) adminProductsLink.classList.remove('hidden');
                if (adminOrdersLink) adminOrdersLink.classList.remove('hidden');
            }
            if (authButtons) authButtons.classList.add('hidden');
            if (logoutButton) logoutButton.classList.remove('hidden');
            if (welcomeMessage) {
                welcomeMessage.textContent = `Welcome ${this.user.name}`;
            }
        } else {
            if (adminProductsLink) adminProductsLink.classList.add('hidden');
            if (adminOrdersLink) adminOrdersLink.classList.add('hidden');
            if (authButtons) authButtons.classList.remove('hidden');
            if (logoutButton) logoutButton.classList.add('hidden');
            if (welcomeMessage) {
                welcomeMessage.textContent = 'Welcome to E-Shop';
            }
        }
    },

    // Initialize auth state
    async init() {
        if (this.isAuthenticated()) {
            try {
                const response = await fetch('http://localhost:8080/users/profile', {
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                });
                const data = await response.json();
                if (data.success) {
                    this.setUser(data.data);
                    this.updateUI();
                } else {
                    this.clear();
                    this.updateUI();
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
                this.clear();
                this.updateUI();
            }
        } else {
            this.updateUI();
        }
    },

    async login(email, password) {
        try {
            const response = await fetch('http://localhost:8080/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            console.log('Login response:', data);

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            if (!data.data?.token) {
                throw new Error('No token received from server');
            }

            this.setToken(data.data.token);
            this.setUser(data.data.user);
            window.location.href = 'index.html';
            return data;
        } catch (error) {
            console.error('Login error details:', error);
            throw error;
        }
    },

    async register(name, email, password) {
        try {
            const response = await fetch('http://localhost:8080/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();
            console.log('Registration response:', data);

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            return data;
        } catch (error) {
            console.error('Registration error details:', error);
            throw error;
        }
    },

    logout() {
        this.clear();
        window.location.href = 'login.html';
    },

    async validateToken() {
        if (!this.isAuthenticated()) {
            this.clear();
            return false;
        }

        try {
            const response = await fetch('http://localhost:8080/users/profile', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) {
                this.clear();
                return false;
            }

            const data = await response.json();
            if (data.success) {
                this.setUser(data.data);
                this.updateUI();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Token validation error:', error);
            this.clear();
            return false;
        }
    }
};

// Initialize auth state when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    auth.init();

    // Handle logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => auth.logout());
    }

    // Handle login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorMessage = document.getElementById('error-message');
            const loading = document.getElementById('loading');

            try {
                loading.classList.add('active');
                await auth.login(email, password);
            } catch (error) {
                errorMessage.textContent = error.message;
                errorMessage.classList.remove('hidden');
            } finally {
                loading.classList.remove('active');
            }
        });
    }
});

// Export auth object
window.auth = auth; 