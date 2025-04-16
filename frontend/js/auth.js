// Auth state management
const auth = {
    token: localStorage.getItem('token'),
    user: null,

    isAuthenticated() {
        return !!this.token;
    },

    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    },

    clearToken() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
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

            this.setToken(data.token);
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
        this.clearToken();
        window.location.href = 'login.html';
    }
};

// Update UI based on auth state
function updateAuthUI() {
    const authButtons = document.getElementById('auth-buttons');
    const logoutBtn = document.getElementById('logout-btn');

    if (auth.isAuthenticated()) {
        authButtons.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
    } else {
        authButtons.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
    }
}

// Initialize auth UI
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();

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
                window.location.href = 'products.html';
            } catch (error) {
                errorMessage.textContent = error.message;
                errorMessage.classList.remove('hidden');
            } finally {
                loading.classList.remove('active');
            }
        });
    }
}); 