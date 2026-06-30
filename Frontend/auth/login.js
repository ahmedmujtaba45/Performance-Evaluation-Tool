/**
 * login.js — E1-US1 User Login
 * AI-Powered Performance Evaluation Tool
 *
 * Responsibilities:
 *  1. Role selector toggle (Manager / HR / Employee / Admin)
 *  2. Client-side form validation (email format, password required)
 *  3. POST credentials to C# backend API  /api/auth/login
 *  4. Handle success → redirect to role-specific dashboard
 *  5. Handle failure → display error message
 *  6. Password visibility toggle
 */

"use strict";

// ── Config ────────────────────────────────────────────────────────────────────
// Change BASE_URL to match your deployed backend address.
const BASE_URL = "https://localhost:7001";

// Route each role to its own dashboard page
const DASHBOARD_MAP = {
    Manager:  "../dashboards/Manager/manager_dashboard.html",
    HR:       "../dashboards/HR/hr_dashboard.html",
    Employee: "../dashboards/Employee/employee_dashboard.html",
    Admin:    "../dashboards/Admin/admin_dashboard.html"
};

// ── DOM references ────────────────────────────────────────────────────────────
const form           = document.getElementById("loginForm");
const emailInput     = document.getElementById("email");
const passwordInput  = document.getElementById("password");
const selectedRole   = document.getElementById("selectedRole");
const roleBtns       = document.querySelectorAll(".role-btn");
const togglePassword = document.getElementById("togglePassword");
const eyeIcon        = document.getElementById("eyeIcon");
const signinBtn      = document.getElementById("signinBtn");
const btnText        = signinBtn.querySelector(".btn-text");
const btnSpinner     = signinBtn.querySelector(".btn-spinner");
const globalError    = document.getElementById("globalError");
const globalErrorTxt = document.getElementById("globalErrorText");
const emailError     = document.getElementById("email-error");
const passwordError  = document.getElementById("password-error");

// ── 1. Role selector ──────────────────────────────────────────────────────────
roleBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        // Remove active from all
        roleBtns.forEach(b => {
            b.classList.remove("active");
            b.setAttribute("aria-pressed", "false");
        });
        // Activate clicked
        btn.classList.add("active");
        btn.setAttribute("aria-pressed", "true");
        selectedRole.value = btn.dataset.role;
    });
});

// ── 2. Password visibility toggle ────────────────────────────────────────────
let passwordVisible = false;

togglePassword.addEventListener("click", () => {
    passwordVisible = !passwordVisible;
    passwordInput.type = passwordVisible ? "text" : "password";
    togglePassword.setAttribute("aria-label", passwordVisible ? "Hide password" : "Show password");

    // Swap SVG between open-eye and eye-with-slash
    eyeIcon.innerHTML = passwordVisible
        ? /* eye-off */
          `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
           <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
           <line x1="1" y1="1" x2="23" y2="23"/>`
        : /* eye */
          `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
           <circle cx="12" cy="12" r="3"/>`;
});

// ── 3. Client-side validation helpers ────────────────────────────────────────
/**
 * Show an error on a specific field.
 * @param {HTMLInputElement} input
 * @param {HTMLElement} errorEl
 * @param {string} message
 */
function showFieldError(input, errorEl, message) {
    errorEl.textContent = message;
    input.classList.add("is-error");
    input.setAttribute("aria-invalid", "true");
}

/**
 * Clear the error on a specific field.
 * @param {HTMLInputElement} input
 * @param {HTMLElement} errorEl
 */
function clearFieldError(input, errorEl) {
    errorEl.textContent = "";
    input.classList.remove("is-error");
    input.removeAttribute("aria-invalid");
}

/** Show the global API-level error banner. */
function showGlobalError(message) {
    globalErrorTxt.textContent = message;
    globalError.hidden = false;
}

/** Hide the global error banner. */
function hideGlobalError() {
    globalError.hidden = true;
    globalErrorTxt.textContent = "";
}

/**
 * Validate the whole form.
 * @returns {boolean} true if all fields are valid
 */
function validateForm() {
    let valid = true;

    // Email
    const emailVal = emailInput.value.trim();
    if (!emailVal) {
        showFieldError(emailInput, emailError, "Email address is required.");
        valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
        showFieldError(emailInput, emailError, "Please enter a valid email address.");
        valid = false;
    } else {
        clearFieldError(emailInput, emailError);
    }

    // Password
    const pwVal = passwordInput.value;
    if (!pwVal) {
        showFieldError(passwordInput, passwordError, "Password is required.");
        valid = false;
    } else {
        clearFieldError(passwordInput, passwordError);
    }

    return valid;
}

// Clear errors on input so user gets instant feedback
emailInput.addEventListener("input",    () => clearFieldError(emailInput,    emailError));
passwordInput.addEventListener("input", () => clearFieldError(passwordInput, passwordError));

// ── 4. Loading state helpers ──────────────────────────────────────────────────
function setLoading(loading) {
    signinBtn.disabled = loading;
    btnText.hidden     = loading;
    btnSpinner.hidden  = !loading;
}

// ── 5. JWT token storage helpers ─────────────────────────────────────────────
// Tokens are stored in sessionStorage so they are cleared when the tab closes.
// For longer sessions, swap sessionStorage for localStorage.
function storeAuthData(token, role, userId) {
    sessionStorage.setItem("authToken", token);
    sessionStorage.setItem("userRole",  role);
    sessionStorage.setItem("userId",    userId);
}

// ── 6. Form submit — POST to /api/auth/login ─────────────────────────────────
form.addEventListener("submit", async (event) => {
    event.preventDefault();
    hideGlobalError();

    // Client-side validation
    if (!validateForm()) return;

    setLoading(true);

    const payload = {
        email:    emailInput.value.trim(),
        password: passwordInput.value,
        role:     selectedRole.value       // included so backend can cross-check
    };

    try {
        const response = await fetch(`${BASE_URL}/api/auth/login`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok && data.token) {
            // Store token and redirect to role dashboard
            storeAuthData(data.token, data.role, data.userId);
            const redirect = DASHBOARD_MAP[data.role] ?? "/dashboards/employee.html";
            window.location.href = redirect;
        } else {
            // 401 / 400 — show message from server or default
            showGlobalError(data.message || "Invalid email or password.");
        }

    } catch {
        // Network failure or server unreachable
        showGlobalError("Unable to reach the server. Please check your connection and try again.");
    } finally {
        setLoading(false);
    }
});
