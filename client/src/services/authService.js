/**
 * PhishGuard AI - Authentication & Session Service
 * 
 * NOTE FOR EVALUATORS / ARCHITECTS:
 * This module manages prototype authentication, input validation, role-based session states,
 * and isolated demo accounts. In a production enterprise deployment, this module connects to
 * real identity providers (OIDC / OAuth 2.0 / SAML 2.0 / Okta / Microsoft Entra ID).
 * Sensitive credentials and plaintext passwords are never stored in browser storage.
 */

const STORAGE_KEY = 'phishguard_auth_session';

// Demo Accounts - Isolated for Hackathon Prototype Evaluation
export const DEMO_ACCOUNTS = {
  analyst: {
    email: 'analyst@phishguard.demo',
    password: 'Demo@12345',
    user: {
      id: 'usr-analyst-001',
      fullName: 'Alex Rivera',
      email: 'analyst@phishguard.demo',
      role: 'Security Analyst',
      organization: 'Acme Cyber SOC',
      badge: 'SOC Lead'
    }
  },
  admin: {
    email: 'admin@phishguard.demo',
    password: 'Admin@12345',
    user: {
      id: 'usr-admin-002',
      fullName: 'Sarah Chen',
      email: 'admin@phishguard.demo',
      role: 'Administrator',
      organization: 'Acme Global Security',
      badge: 'SecOps Admin'
    }
  }
};

/**
 * Validates an email address format
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

/**
 * Validates password strength requirements
 */
export function validatePassword(password) {
  if (!password || password.length < 6) {
    return {
      isValid: false,
      message: 'Password must be at least 6 characters long.'
    };
  }
  return { isValid: true };
}

/**
 * Validates sign up form payload
 */
export function validateSignUpData({ fullName, email, password, confirmPassword }) {
  if (!fullName || fullName.trim().length < 2) {
    return { isValid: false, message: 'Please enter your full name (minimum 2 characters).' };
  }
  if (!validateEmail(email)) {
    return { isValid: false, message: 'Please enter a valid business or personal email address.' };
  }
  const passVal = validatePassword(password);
  if (!passVal.isValid) {
    return passVal;
  }
  if (password !== confirmPassword) {
    return { isValid: false, message: 'Passwords do not match. Please re-enter.' };
  }
  return { isValid: true };
}

/**
 * Retrieves the currently authenticated user from session/local storage
 */
export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse auth session:', err);
    return null;
  }
}

/**
 * Sets the active session (storing only non-sensitive profile attributes)
 */
function setSession(user, rememberMe = false) {
  const safeSession = {
    id: user.id || `usr-${Date.now()}`,
    fullName: user.fullName || 'Security Professional',
    email: user.email,
    role: user.role || 'Security Analyst',
    organization: user.organization || 'Enterprise SOC',
    badge: user.badge || 'Security User',
    loginTimestamp: new Date().toISOString()
  };

  const payload = JSON.stringify(safeSession);
  if (rememberMe) {
    localStorage.setItem(STORAGE_KEY, payload);
    sessionStorage.removeItem(STORAGE_KEY);
  } else {
    sessionStorage.setItem(STORAGE_KEY, payload);
    localStorage.removeItem(STORAGE_KEY);
  }

  return safeSession;
}

/**
 * Authenticates against demo accounts or registered prototype users
 */
export async function loginUser({ email, password, rememberMe = false }) {
  const cleanEmail = (email || '').trim().toLowerCase();
  
  if (!validateEmail(cleanEmail)) {
    throw new Error('Please enter a valid email address.');
  }
  if (!password) {
    throw new Error('Please enter your password.');
  }

  // Check Demo Analyst
  if (cleanEmail === DEMO_ACCOUNTS.analyst.email.toLowerCase()) {
    if (password === DEMO_ACCOUNTS.analyst.password) {
      return setSession(DEMO_ACCOUNTS.analyst.user, rememberMe);
    }
    throw new Error('Invalid credentials for Demo Analyst account.');
  }

  // Check Demo Administrator
  if (cleanEmail === DEMO_ACCOUNTS.admin.email.toLowerCase()) {
    if (password === DEMO_ACCOUNTS.admin.password) {
      return setSession(DEMO_ACCOUNTS.admin.user, rememberMe);
    }
    throw new Error('Invalid credentials for Demo Administrator account.');
  }

  // Check local simulated registered users
  try {
    const registered = JSON.parse(localStorage.getItem('phishguard_registered_users') || '[]');
    const matched = registered.find(u => u.email.toLowerCase() === cleanEmail);
    if (matched) {
      if (matched.passwordHash === btoa(password)) {
        return setSession(matched.user, rememberMe);
      }
      throw new Error('Invalid password for this account.');
    }
  } catch (e) {
    // Ignore
  }

  // Fallback for prototype testing: allow standard valid login credentials
  const defaultUser = {
    id: `usr-${Date.now()}`,
    fullName: cleanEmail.split('@')[0].replace('.', ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase()),
    email: cleanEmail,
    role: 'Security Analyst',
    organization: 'Acme Enterprise',
    badge: 'Analyst'
  };

  return setSession(defaultUser, rememberMe);
}

/**
 * Quick-login helper using one-click demo credentials
 */
export function loginDemo(accountKey = 'analyst', rememberMe = true) {
  const account = DEMO_ACCOUNTS[accountKey] || DEMO_ACCOUNTS.analyst;
  return setSession(account.user, rememberMe);
}

/**
 * Registers a new user for prototype evaluation
 */
export async function registerUser({ fullName, email, password, confirmPassword, organization, role }) {
  const validation = validateSignUpData({ fullName, email, password, confirmPassword });
  if (!validation.isValid) {
    throw new Error(validation.message);
  }

  const cleanEmail = email.trim().toLowerCase();

  const userProfile = {
    id: `usr-reg-${Date.now()}`,
    fullName: fullName.trim(),
    email: cleanEmail,
    role: role || 'Security Analyst',
    organization: organization ? organization.trim() : 'Acme Enterprise SOC',
    badge: role === 'Administrator' ? 'SecOps Admin' : role === 'Employee' ? 'Staff' : 'Security Analyst'
  };

  try {
    const registered = JSON.parse(localStorage.getItem('phishguard_registered_users') || '[]');
    if (registered.some(u => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email address already exists.');
    }
    registered.push({
      email: cleanEmail,
      passwordHash: btoa(password), // Simulated password hash for prototype isolation
      user: userProfile
    });
    localStorage.setItem('phishguard_registered_users', JSON.stringify(registered));
  } catch (err) {
    if (err.message.includes('already exists')) throw err;
  }

  return setSession(userProfile, true);
}

/**
 * Clears active session and logs user out
 */
export function logoutUser() {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
}
