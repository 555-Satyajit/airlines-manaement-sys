// auth-utils.js - Centralized authentication management
class AuthManager {
    constructor() {
        this.TOKEN_KEY = 'skyline_auth_token';
        this.USER_KEY = 'skyline_user_data';
        this.REFRESH_TOKEN_KEY = 'skyline_refresh_token';
        this.apiBaseUrl = 'http://localhost:5000/api';
    }

    // Store authentication data
    setAuthData(token, refreshToken = null, userData = null) {
        try {
            // Store in both localStorage and sessionStorage for redundancy
            if (typeof Storage !== "undefined") {
                localStorage.setItem(this.TOKEN_KEY, token);
                sessionStorage.setItem(this.TOKEN_KEY, token);
                
                if (refreshToken) {
                    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
                    sessionStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
                }
                
                if (userData) {
                    localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
                    sessionStorage.setItem(this.USER_KEY, JSON.stringify(userData));
                }
            }
            
            // Also store in memory for current session
            this.currentToken = token;
            this.currentUser = userData;
            this.currentRefreshToken = refreshToken;
            
            console.log('Auth data stored successfully');
            return true;
        } catch (error) {
            console.error('Failed to store auth data:', error);
            return false;
        }
    }

    // Get authentication token with multiple fallbacks
    getAuthToken() {
        try {
            // First check memory
            if (this.currentToken && this.isValidJWT(this.currentToken)) {
                return this.currentToken;
            }

            // Check localStorage
            if (typeof Storage !== "undefined" && localStorage.getItem) {
                const token = localStorage.getItem(this.TOKEN_KEY);
                if (token && this.isValidJWT(token)) {
                    this.currentToken = token;
                    return token;
                }
            }

            // Check sessionStorage
            if (typeof Storage !== "undefined" && sessionStorage.getItem) {
                const token = sessionStorage.getItem(this.TOKEN_KEY);
                if (token && this.isValidJWT(token)) {
                    this.currentToken = token;
                    return token;
                }
            }

            // Check URL parameters (for redirects)
            const urlParams = new URLSearchParams(window.location.search);
            const urlToken = urlParams.get('token');
            if (urlToken && this.isValidJWT(urlToken)) {
                // Store the token from URL
                this.setAuthData(urlToken);
                // Clean up URL
                this.cleanUrlParams();
                return urlToken;
            }

            return null;
        } catch (error) {
            console.error('Error retrieving auth token:', error);
            return null;
        }
    }

    // Get refresh token
    getRefreshToken() {
        try {
            if (this.currentRefreshToken) return this.currentRefreshToken;

            if (typeof Storage !== "undefined") {
                return localStorage.getItem(this.REFRESH_TOKEN_KEY) || 
                       sessionStorage.getItem(this.REFRESH_TOKEN_KEY);
            }
            return null;
        } catch (error) {
            console.error('Error retrieving refresh token:', error);
            return null;
        }
    }

    // Get user data
    getUserData() {
        try {
            if (this.currentUser) return this.currentUser;

            if (typeof Storage !== "undefined") {
                const userData = localStorage.getItem(this.USER_KEY) || 
                               sessionStorage.getItem(this.USER_KEY);
                if (userData) {
                    this.currentUser = JSON.parse(userData);
                    return this.currentUser;
                }
            }
            return null;
        } catch (error) {
            console.error('Error retrieving user data:', error);
            return null;
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        const token = this.getAuthToken();
        return token !== null && this.isValidJWT(token) && !this.isTokenExpired(token);
    }

    // Validate JWT format
    isValidJWT(token) {
        if (!token || typeof token !== 'string') return false;
        
        const parts = token.split('.');
        if (parts.length !== 3) return false;
        
        try {
            parts.forEach(part => {
                if (part.length === 0) throw new Error('Empty part');
                atob(part.replace(/-/g, '+').replace(/_/g, '/'));
            });
            return true;
        } catch (error) {
            return false;
        }
    }

    // Check if token is expired
    isTokenExpired(token) {
        if (!token || !this.isValidJWT(token)) return true;
        
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);
            return payload.exp && payload.exp < currentTime;
        } catch (error) {
            console.error('Error checking token expiration:', error);
            return true;
        }
    }

    // Refresh authentication token
    async refreshAuthToken() {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken })
            });

            if (!response.ok) {
                throw new Error('Token refresh failed');
            }

            const data = await response.json();
            this.setAuthData(data.token, data.refreshToken, data.user);
            
            return data.token;
        } catch (error) {
            console.error('Token refresh failed:', error);
            this.clearAuthData();
            throw error;
        }
    }

    // Clear all authentication data
    clearAuthData() {
        try {
            if (typeof Storage !== "undefined") {
                localStorage.removeItem(this.TOKEN_KEY);
                localStorage.removeItem(this.USER_KEY);
                localStorage.removeItem(this.REFRESH_TOKEN_KEY);
                sessionStorage.removeItem(this.TOKEN_KEY);
                sessionStorage.removeItem(this.USER_KEY);
                sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
            }
            
            this.currentToken = null;
            this.currentUser = null;
            this.currentRefreshToken = null;
            
            console.log('Auth data cleared');
        } catch (error) {
            console.error('Error clearing auth data:', error);
        }
    }

    // Clean URL parameters
    cleanUrlParams() {
        try {
            const url = new URL(window.location);
            url.searchParams.delete('token');
            window.history.replaceState({}, document.title, url.toString());
        } catch (error) {
            console.error('Error cleaning URL params:', error);
        }
    }

    // Redirect to login with return URL
    redirectToLogin(returnUrl = null) {
        const currentUrl = returnUrl || window.location.href;
        const loginUrl = `/login.html?redirect=${encodeURIComponent(currentUrl)}`;
        window.location.href = loginUrl;
    }

    // Enhanced API call with automatic token refresh
    async apiCall(endpoint, method = 'GET', data = null, requireAuth = true) {
        const config = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        // Add auth token if available and required
        if (requireAuth) {
            let token = this.getAuthToken();
            
            // If token is expired, try to refresh it
            if (token && this.isTokenExpired(token)) {
                try {
                    token = await this.refreshAuthToken();
                } catch (error) {
                    console.error('Token refresh failed:', error);
                    this.redirectToLogin();
                    return;
                }
            }
            
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            } else if (requireAuth) {
                this.redirectToLogin();
                return;
            }
        }

        // Add body for POST/PUT requests
        if (data && (method === 'POST' || method === 'PUT')) {
            config.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}${endpoint}`, config);
            
            // Handle authentication errors
            if (response.status === 401) {
                console.warn('Authentication failed');
                
                // Try token refresh one more time
                if (requireAuth && this.getRefreshToken()) {
                    try {
                        const newToken = await this.refreshAuthToken();
                        // Retry the original request with new token
                        config.headers.Authorization = `Bearer ${newToken}`;
                        const retryResponse = await fetch(`${this.apiBaseUrl}${endpoint}`, config);
                        if (retryResponse.ok) {
                            return await retryResponse.json();
                        }
                    } catch (refreshError) {
                        console.error('Token refresh retry failed:', refreshError);
                    }
                }
                
                this.clearAuthData();
                this.redirectToLogin();
                return;
            }
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            throw error;
        }
    }
}

// Create global instance
window.authManager = new AuthManager();