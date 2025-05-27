// Fixed Authentication JavaScript for SkyLine Airlines
// Place this script at the end of your HTML body

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Auth script starting...');
    
    // Get all form elements and containers
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const emailVerificationNotice = document.getElementById('emailVerificationNotice');
    
    // Get form elements
    const loginFormElement = document.getElementById('loginFormElement');
    const registerFormElement = document.getElementById('registerFormElement');
    const forgotPasswordFormElement = document.getElementById('forgotPasswordFormElement');
    
    // Debug: Check if critical elements exist
    console.log('Element check:', {
        loginForm: !!loginForm,
        loginFormElement: !!loginFormElement
    });
    
    // Get navigation buttons
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    
    // Get form switching buttons
    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');
    const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
    const backToLogin = document.getElementById('backToLogin');
    const backToLoginFromVerification = document.getElementById('backToLoginFromVerification');
    
    // Get password toggle buttons
    const toggleLoginPassword = document.getElementById('toggleLoginPassword');
    const toggleRegisterPassword = document.getElementById('toggleRegisterPassword');
    
    // Get loading elements
    const loginSpinner = document.getElementById('loginSpinner');
    const registerSpinner = document.getElementById('registerSpinner');
    const forgotSpinner = document.getElementById('forgotSpinner');
    
    const loginBtnText = document.getElementById('loginBtnText');
    const registerBtnText = document.getElementById('registerBtnText');
    const forgotBtnText = document.getElementById('forgotBtnText');
    
    // Toast notification
    const toast = document.getElementById('toast');
    const toastIcon = document.getElementById('toastIcon');
    const toastMessage = document.getElementById('toastMessage');

    // API Base URL - FIXED: Remove trailing slash issues
const API_BASE_URL = 'mongodb+srv://pujapandasatyajit:5AKcloRlTIXKAwMe@cluster0.zn78p.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'; // Replace with your actual API URL
function saveAuthToken(token) {
    try {
        // Since we can't use localStorage in artifacts, store in memory and sessionStorage as fallback
        window.authToken = token;
        
        // Try sessionStorage if available
        if (typeof Storage !== "undefined") {
            sessionStorage.setItem('authToken', token);
        }
        console.log('✅ Auth token saved');
    } catch (error) {
        console.warn('Failed to save auth token:', error);
    }
}

function getAuthToken() {
    try {
        // Check memory first
        if (window.authToken) {
            return window.authToken;
        }
        
        // Fallback to sessionStorage
        if (typeof Storage !== "undefined") {
            return sessionStorage.getItem('authToken');
        }
        
        return null;
    } catch (error) {
        console.warn('Failed to get auth token:', error);
        return null;
    }
}

function clearAuthToken() {
    try {
        // Clear from memory
        window.authToken = null;
        
        // Clear from sessionStorage
        if (typeof Storage !== "undefined") {
            sessionStorage.removeItem('authToken');
        }
        console.log('✅ Auth token cleared');
    } catch (error) {
        console.warn('Failed to clear auth token:', error);
    }
}
    // Form switching functions
    function showLoginForm() {
        hideAllForms();
        if (loginForm) {
            loginForm.classList.remove('hidden');
            loginForm.classList.add('fade-in');
        }
    }

    function showRegisterForm() {
        hideAllForms();
        if (registerForm) {
            registerForm.classList.remove('hidden');
            registerForm.classList.add('slide-in');
        }
    }

    function showForgotPasswordForm() {
        hideAllForms();
        if (forgotPasswordForm) {
            forgotPasswordForm.classList.remove('hidden');
            forgotPasswordForm.classList.add('slide-in');
        }
    }

    function showEmailVerificationNotice(email) {
        hideAllForms();
        const verificationEmailSpan = document.getElementById('verificationEmail');
        if (verificationEmailSpan) {
            verificationEmailSpan.textContent = email;
        }
        if (emailVerificationNotice) {
            emailVerificationNotice.classList.remove('hidden');
            emailVerificationNotice.classList.add('fade-in');
        }
    }

    function hideAllForms() {
        const forms = [loginForm, registerForm, forgotPasswordForm, emailVerificationNotice];
        forms.forEach(form => {
            if (form) {
                form.classList.add('hidden');
                form.classList.remove('fade-in', 'slide-in');
            }
        });
    }

    // Password visibility toggle
    function togglePasswordVisibility(inputId, toggleBtn) {
        const input = document.getElementById(inputId);
        if (!input || !toggleBtn) return;
        
        const icon = toggleBtn.querySelector('i');
        if (!icon) return;
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    }

    // Password strength checker
    function checkPasswordStrength(password) {
        const strengthDiv = document.getElementById('passwordStrength');
        if (!strengthDiv) return;
        
        let strength = 0;
        let feedback = [];

        if (password.length >= 8) strength++;
        else feedback.push('At least 8 characters');

        if (/[A-Z]/.test(password)) strength++;
        else feedback.push('One uppercase letter');

        if (/[a-z]/.test(password)) strength++;
        else feedback.push('One lowercase letter');

        if (/\d/.test(password)) strength++;
        else feedback.push('One number');

        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
        else feedback.push('One special character');

        let strengthText = '';
        let strengthClass = '';

        switch (strength) {
            case 0:
            case 1:
                strengthText = 'Very Weak';
                strengthClass = 'text-red-500';
                break;
            case 2:
                strengthText = 'Weak';
                strengthClass = 'text-orange-500';
                break;
            case 3:
                strengthText = 'Fair';
                strengthClass = 'text-yellow-500';
                break;
            case 4:
                strengthText = 'Good';
                strengthClass = 'text-blue-500';
                break;
            case 5:
                strengthText = 'Strong';
                strengthClass = 'text-green-500';
                break;
        }

        if (password.length > 0) {
            strengthDiv.innerHTML = `
                <div class="flex items-center justify-between">
                    <span class="${strengthClass} font-medium">Password Strength: ${strengthText}</span>
                </div>
                ${feedback.length > 0 ? `<div class="text-xs text-gray-500 mt-1">Missing: ${feedback.join(', ')}</div>` : ''}
            `;
        } else {
            strengthDiv.innerHTML = '';
        }
    }

    // Toast notification function
    function showToast(message, type = 'info') {
        if (!toast || !toastIcon || !toastMessage) {
            // Fallback to alert if toast elements don't exist
            alert(message);
            return;
        }
        
        const toastTypes = {
            success: { icon: 'fas fa-check-circle', class: 'bg-green-500 text-white' },
            error: { icon: 'fas fa-exclamation-circle', class: 'bg-red-500 text-white' },
            warning: { icon: 'fas fa-exclamation-triangle', class: 'bg-orange-500 text-white' },
            info: { icon: 'fas fa-info-circle', class: 'bg-blue-500 text-white' }
        };

        const toastConfig = toastTypes[type] || toastTypes.info;
        
        toastIcon.className = toastConfig.icon;
        toastMessage.textContent = message;
        toast.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg max-w-sm z-50 ${toastConfig.class}`;
        
        toast.classList.remove('hidden');
        
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 5000);
    }

    // Loading state management
    function setLoadingState(button, spinner, textElement, isLoading) {
        if (!button) return;
        
        if (isLoading) {
            button.disabled = true;
            if (spinner) spinner.classList.remove('hidden');
            if (textElement) textElement.textContent = 'Please wait...';
            button.classList.add('opacity-75');
        } else {
            button.disabled = false;
            if (spinner) spinner.classList.add('hidden');
            button.classList.remove('opacity-75');
        }
    }

    // Email validation
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Phone validation
    function isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    }

    // API request helper - FIXED: Better error handling
   async function makeAPIRequest(endpoint, method, data = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        };

        // ADD: Include auth token if available
        const token = getAuthToken();
        if (token) {
            options.headers.Authorization = `Bearer ${token}`;
        }

        if (data) {
            options.body = JSON.stringify(data);
        }

        console.log(`Making ${method} request to: ${API_BASE_URL}${endpoint}`);
        if (data) console.log('Request data:', data);

        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        console.log('Response status:', response.status);
        
        let result;
        try {
            result = await response.json();
            console.log('Response data:', result);
        } catch (e) {
            console.error('Failed to parse JSON response:', e);
            throw new Error('Invalid response from server');
        }

        // ADD: Handle token expiry
        if (response.status === 401) {
            clearAuthToken();
            window.currentUser = null;
            showLoginForm();
            throw new Error('Session expired. Please login again.');
        }

        if (!response.ok) {
            throw new Error(result.message || `HTTP error! status: ${response.status}`);
        }

        return result;
    } catch (error) {
        console.error('API Request failed:', error);
        throw error;
    }
 }

    // Redirect to dashboard based on user role
    function redirectToDashboard(user) {
        if (!user || typeof user !== 'object') {
            console.error('Invalid user object:', user);
            showToast('Invalid user data received. Please try logging in again.', 'error');
            return;
        }

        console.log('Redirecting user to dashboard:', user);

        // Store user data for the dashboard (but handle storage errors gracefully)
        try {
            // Save token in multiple ways for reliability
            const token = getAuthToken();
            if (token) {
                window.authToken = token;
                try {
                    if (localStorage) localStorage.setItem('authToken', token);
                    if (sessionStorage) sessionStorage.setItem('authToken', token);
                } catch (e) {
                    console.warn('Storage not available, using memory only');
                }
            }

            // Create redirect URL with token and user data as parameters
            const redirectUrl = new URL('dashboard.html', window.location.origin);

            if (token) {
                redirectUrl.searchParams.set('token', token);
            }

            // Redirect based on user role
            const userRole = user.role || 'user';

            if (userRole === 'admin') {
                console.log('Redirecting to admin dashboard');
                window.location.href = '/admin-dashboard.html';
            } else {
                console.log('Redirecting to user dashboard');
                window.location.href = '/dashboard.html';
            }
        } catch (e) {
            console.error('Error during dashboard redirect:', e);
            showToast('Failed to redirect. Please try again.', 'error');
        }
    }
    

// CRITICAL FIX: Login form submission with proper error handling
if (loginFormElement) {
    console.log('✅ Login form found, attaching event listener...');
    
    loginFormElement.addEventListener('submit', async (e) => {
        console.log('🎯 LOGIN FORM SUBMITTED');
        
        // CRITICAL: Prevent default form submission
        e.preventDefault();
        e.stopPropagation();
        console.log('✅ Default form submission prevented');
        
        const emailInput = document.getElementById('loginEmail');
        const passwordInput = document.getElementById('loginPassword');
        const rememberMeInput = document.getElementById('rememberMe');
        
        if (!emailInput || !passwordInput) {
            console.error('❌ Login form inputs not found');
            showToast('Form elements not found. Please refresh the page.', 'error');
            return;
        }
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const rememberMe = rememberMeInput ? rememberMeInput.checked : false;

        console.log('📝 Form data:', { 
            email: email ? 'provided' : 'missing',
            password: password ? 'provided' : 'missing',
            rememberMe 
        });

        // Basic validation
        if (!email || !password) {
            showToast('Please fill in all fields', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            showToast('Please enter a valid email address', 'error');
            return;
        }

        // Set loading state
        const submitButton = loginFormElement.querySelector('button[type="submit"]');
        setLoadingState(submitButton, loginSpinner, loginBtnText, true);

        try {
            console.log('🌐 Making login API request...');
            const response = await makeAPIRequest('/auth/login', 'POST', {
                email,
                password,
                rememberMe
            });

            console.log('✅ Login API response received:', response);

            // MODIFY: Save the token from response
            if (response.token) {
                saveAuthToken(response.token);
                console.log('✅ Auth token saved from login response');
            } else {
                console.warn('⚠️ No token received in login response');
            }

            // Handle different response structures
            let user;
            if (response.user) {
                user = response.user;
            } else if (response._id || response.id) {
                user = response;
            } else {
                console.error('Invalid response structure:', response);
                throw new Error('Invalid response from server');
            }

            showToast('Login successful! Redirecting...', 'success');
            
            // Redirect after a short delay
            setTimeout(() => {
                redirectToDashboard(user);
            }, 1500);

        } catch (error) {
            console.error('❌ Login error:', error);
            showToast(error.message || 'Login failed. Please try again.', 'error');
        } finally {
            // Reset loading state
            setLoadingState(submitButton, loginSpinner, loginBtnText, false);
            if (loginBtnText) loginBtnText.textContent = 'Sign In';
        }
    });
}

// 4. ADD: Logout function (add this as a new function)
function logout() {
    clearAuthToken();
    window.currentUser = null;
    showToast('Logged out successfully', 'success');
    showLoginForm();

}
    // Event Listeners for navigation and form switching
    if (loginBtn) loginBtn.addEventListener('click', showLoginForm);
    if (registerBtn) registerBtn.addEventListener('click', showRegisterForm);
    if (switchToRegister) switchToRegister.addEventListener('click', showRegisterForm);
    if (switchToLogin) switchToLogin.addEventListener('click', showLoginForm);
    if (forgotPasswordBtn) forgotPasswordBtn.addEventListener('click', showForgotPasswordForm);
    if (backToLogin) backToLogin.addEventListener('click', showLoginForm);
    if (backToLoginFromVerification) backToLoginFromVerification.addEventListener('click', showLoginForm);

    // Password toggle buttons
    if (toggleLoginPassword) {
        toggleLoginPassword.addEventListener('click', () => {
            togglePasswordVisibility('loginPassword', toggleLoginPassword);
        });
    }

    if (toggleRegisterPassword) {
        toggleRegisterPassword.addEventListener('click', () => {
            togglePasswordVisibility('registerPassword', toggleRegisterPassword);
        });
    }

    // Password strength checker
    const registerPasswordInput = document.getElementById('registerPassword');
    if (registerPasswordInput) {
        registerPasswordInput.addEventListener('input', (e) => {
            checkPasswordStrength(e.target.value);
        });
    }

    // Confirm password validation
    const confirmPasswordInput = document.getElementById('confirmPassword');
    if (confirmPasswordInput && registerPasswordInput) {
        confirmPasswordInput.addEventListener('blur', () => {
            const password = registerPasswordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            
            if (confirmPassword && password !== confirmPassword) {
                confirmPasswordInput.setCustomValidity('Passwords do not match');
                confirmPasswordInput.reportValidity();
            } else {
                confirmPasswordInput.setCustomValidity('');
            }
        });
    }

    // Registration form submission
    if (registerFormElement) {
        registerFormElement.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                firstName: document.getElementById('firstName')?.value.trim() || '',
                lastName: document.getElementById('lastName')?.value.trim() || '',
                email: document.getElementById('registerEmail')?.value.trim() || '',
                phone: document.getElementById('phone')?.value.trim() || '',
                password: document.getElementById('registerPassword')?.value || '',
                confirmPassword: document.getElementById('confirmPassword')?.value || '',
                dateOfBirth: document.getElementById('dateOfBirth')?.value || '',
                agreeTerms: document.getElementById('agreeTerms')?.checked || false
            };

            // Validation
            if (!formData.firstName || !formData.lastName || !formData.email || 
                !formData.phone || !formData.password || !formData.confirmPassword || 
                !formData.dateOfBirth) {
                showToast('Please fill in all fields', 'error');
                return;
            }

            if (!isValidEmail(formData.email)) {
                showToast('Please enter a valid email address', 'error');
                return;
            }

            if (!isValidPhone(formData.phone)) {
                showToast('Please enter a valid phone number', 'error');
                return;
            }

            if (formData.password !== formData.confirmPassword) {
                showToast('Passwords do not match', 'error');
                return;
            }

            if (formData.password.length < 8) {
                showToast('Password must be at least 8 characters long', 'error');
                return;
            }

            if (!formData.agreeTerms) {
                showToast('Please agree to the Terms of Service and Privacy Policy', 'error');
                return;
            }

            // Age validation
            const birthDate = new Date(formData.dateOfBirth);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            if (age < 13) {
                showToast('You must be at least 13 years old to register', 'error');
                return;
            }

            const submitButton = registerFormElement.querySelector('button[type="submit"]');
            setLoadingState(submitButton, registerSpinner, registerBtnText, true);

            try {
                await makeAPIRequest('/auth/register', 'POST', {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phone: formData.phone,
                    password: formData.password,
                    dateOfBirth: formData.dateOfBirth
                });

                showToast('Registration successful! Please check your email for verification.', 'success');
                
                setTimeout(() => {
                    showEmailVerificationNotice(formData.email);
                }, 2000);

            } catch (error) {
                showToast(error.message || 'Registration failed. Please try again.', 'error');
            } finally {
                setLoadingState(submitButton, registerSpinner, registerBtnText, false);
                if (registerBtnText) registerBtnText.textContent = 'Create Account';
            }
        });
    }

    // Forgot password form submission
    if (forgotPasswordFormElement) {
        forgotPasswordFormElement.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const emailInput = document.getElementById('forgotEmail');
            const email = emailInput ? emailInput.value.trim() : '';

            if (!email) {
                showToast('Please enter your email address', 'error');
                return;
            }

            if (!isValidEmail(email)) {
                showToast('Please enter a valid email address', 'error');
                return;
            }

            const submitButton = forgotPasswordFormElement.querySelector('button[type="submit"]');
            setLoadingState(submitButton, forgotSpinner, forgotBtnText, true);

            try {
                await makeAPIRequest('/auth/forgot-password', 'POST', { email });
                showToast('Password reset link sent to your email', 'success');
                
                setTimeout(() => {
                    showLoginForm();
                }, 3000);

            } catch (error) {
                showToast(error.message || 'Failed to send reset email. Please try again.', 'error');
            } finally {
                setLoadingState(submitButton, forgotSpinner, forgotBtnText, false);
                if (forgotBtnText) forgotBtnText.textContent = 'Send Reset Link';
            }
        });
    }

    // Resend verification email
    const resendVerificationBtn = document.getElementById('resendVerification');
    if (resendVerificationBtn) {
        resendVerificationBtn.addEventListener('click', async () => {
            const emailSpan = document.getElementById('verificationEmail');
            const email = emailSpan ? emailSpan.textContent : '';
            
            try {
                await makeAPIRequest('/auth/resend-verification', 'POST', { email });
                showToast('Verification email resent successfully', 'success');
            } catch (error) {
                showToast('Failed to resend verification email', 'error');
            }
        });
    }

    // Initialize - Check auth status
    async function checkAuthStatus() {
        try {
            const response = await makeAPIRequest('/auth/me', 'GET');
            
            let user;
            if (response && response.user) {
                user = response.user;
            } else if (response && (response._id || response.id)) {
                user = response;
            }
            
            if (user) {
                redirectToDashboard(user);
            } else {
                showLoginForm();
            }
        } catch (error) {
            console.log('Auth check failed (normal if not logged in):', error.message);
            showLoginForm();
        }
    }

    // Initialize the page
    checkAuthStatus();

    // Handle browser back button
    window.addEventListener('popstate', () => {
        showLoginForm();
    });
    
    console.log('🎉 Auth script initialization complete');
});