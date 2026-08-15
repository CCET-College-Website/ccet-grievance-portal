import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import styles from './Login.module.css';
import bgImage from '../../assets/CCET-BG.png';
import ccetLogo from '../../assets/CCET-LOGO.png';

// Hosted grievance API
const API_BASE_URL = 'https://ccet.ac.in/api-grievance/auth.php';
const OTP_API_URL = 'https://ccet.ac.in/api-grievance/otp.php';

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const BRANCHES = [
    'Computer Science',
    'Information Technology',
    'Electronics & Comm.',
    'Electrical',
    'Mechanical',
    'Civil',
];

export default function Login() {
    // 'login' | 'register' — drives the slide animation
    const [mode, setMode] = useState('login');

    // The two cards sit side by side so they can slide, but a flex row
    // always sizes itself to its tallest child — which left the shorter
    // login card floating in a box as tall as the register card. Measuring
    // the active card and animating the switcher to that exact height
    // fixes it so the container always matches whichever form is showing.
    const loginCardRef = useRef(null);
    const registerCardRef = useRef(null);
    const otpCardRef = useRef(null);
    const [switcherHeight, setSwitcherHeight] = useState(null);

    const getActiveCardEl = (m) => {
        if (m === 'login') return loginCardRef.current;
        if (m === 'register') return registerCardRef.current;
        return otpCardRef.current;
    };

    useLayoutEffect(() => {
        const activeEl = getActiveCardEl(mode);
        if (activeEl) {
            setSwitcherHeight(activeEl.offsetHeight);
        }
    }, [mode]);

    useEffect(() => {
        const handleResize = () => {
            const activeEl = getActiveCardEl(mode);
            if (activeEl) {
                setSwitcherHeight(activeEl.offsetHeight);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [mode]);

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [serverError, setServerError] = useState('');

    const [regData, setRegData] = useState({
        name: '',
        rollNumber: '',
        year: '',
        branch: '',
        email: '',
        phone: '',
        password: '',
    });
    const [regErrors, setRegErrors] = useState({});
    const [isRegLoading, setIsRegLoading] = useState(false);
    const [showRegPassword, setShowRegPassword] = useState(false);
    const [regServerError, setRegServerError] = useState('');
    const [regSuccess, setRegSuccess] = useState('');

    // Email OTP verification (required before registration)
    const [otpSent, setOtpSent] = useState(false);
    const [otpValue, setOtpValue] = useState('');
    const [otpVerified, setOtpVerified] = useState(false);
    const [otpSending, setOtpSending] = useState(false);
    const [otpVerifying, setOtpVerifying] = useState(false);
    const [otpError, setOtpError] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);

    useEffect(() => {
        if (resendCooldown <= 0) return;
        const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [resendCooldown]);

    const goToRegister = () => setMode('register');
    const goToLogin = () => {
        setMode('login');
        setOtpSent(false);
        setOtpVerified(false);
        setOtpValue('');
        setOtpError('');
        setResendCooldown(0);
    };
    const goBackToRegisterForm = () => {
        setMode('register');
        setOtpSent(false);
        setOtpValue('');
        setOtpError('');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
        if (serverError) setServerError('');
    };

    const handleFocus = (e) => {
        const { name } = e.target;
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const errs = {};
        if (!formData.email.trim()) {
            errs.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errs.email = 'Please enter a valid email';
        }
        if (!formData.password) {
            errs.password = 'Password is required';
        } else if (formData.password.length < 6) {
            errs.password = 'Password must be at least 6 characters';
        }
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setServerError('');
        setIsLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}?action=login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email.trim(),
                    password: formData.password,
                }),
            });

            const data = await res.json();

            if (!data.success) {
                setServerError(data.error || 'Invalid email or password');
                return;
            }

            // Successful login — user record (no password) comes back in data.user
            sessionStorage.setItem('ccet_user', JSON.stringify(data.user));
            window.location.href = '/dashboard'; // adjust to your actual post-login route
        } catch (err) {
            setServerError('Could not reach the server. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegChange = (e) => {
        const { name, value } = e.target;
        setRegData((prev) => ({ ...prev, [name]: value }));
        if (regErrors[name]) {
            setRegErrors((prev) => ({ ...prev, [name]: '' }));
        }
        if (regServerError) setRegServerError('');
        if (regSuccess) setRegSuccess('');

        // Changing the email after verifying it invalidates that verification
        if (name === 'email' && (otpSent || otpVerified)) {
            setOtpSent(false);
            setOtpVerified(false);
            setOtpValue('');
            setOtpError('');
            setResendCooldown(0);
        }
    };

    const handleOtpChange = (e) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
        setOtpValue(val);
        if (otpError) setOtpError('');
    };

    // Used by the "Resend OTP" button on the OTP slide — the email was
    // already validated on the registration form before we ever get here.
    const handleSendOtp = async () => {
        setOtpError('');
        setOtpSending(true);
        try {
            const res = await fetch(`${OTP_API_URL}?action=send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: regData.email.trim() }),
            });
            const data = await res.json();

            if (!data.success) {
                setOtpError(data.error || 'Could not send OTP');
                return;
            }

            setOtpSent(true);
            setOtpValue('');
            setResendCooldown(60);
        } catch (err) {
            setOtpError('Could not reach the server. Please try again.');
        } finally {
            setOtpSending(false);
        }
    };

    // Runs on the OTP slide: verifies the code, then immediately completes
    // registration with the details already collected on the previous slide.
    const handleVerifyAndRegister = async (e) => {
        e.preventDefault();
        if (otpValue.length !== 6) return;

        setOtpError('');
        setOtpVerifying(true);
        try {
            const verifyRes = await fetch(`${OTP_API_URL}?action=verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: regData.email.trim(), otp: otpValue }),
            });
            const verifyData = await verifyRes.json();

            if (!verifyData.success) {
                setOtpError(verifyData.error || 'Invalid or expired OTP');
                return;
            }

            setOtpVerified(true);

            const res = await fetch(`${API_BASE_URL}?action=register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: regData.name.trim(),
                    rollNumber: regData.rollNumber.trim(),
                    year: regData.year,
                    branch: regData.branch,
                    email: regData.email.trim(),
                    phone: regData.phone.trim(),
                    password: regData.password,
                }),
            });
            const data = await res.json();

            if (!data.success) {
                setOtpError(data.error || 'Registration failed. Please try again.');
                return;
            }

            setRegSuccess('Registered successfully! You can now sign in.');
            setRegData({
                name: '',
                rollNumber: '',
                year: '',
                branch: '',
                email: '',
                phone: '',
                password: '',
            });
            setOtpSent(false);
            setOtpVerified(false);
            setOtpValue('');
            setTimeout(goToLogin, 1200);
        } catch (err) {
            setOtpError('Could not reach the server. Please try again.');
        } finally {
            setOtpVerifying(false);
        }
    };

    const handleRegFocus = (e) => {
        const { name } = e.target;
        if (regErrors[name]) {
            setRegErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validateReg = () => {
        const errs = {};
        if (!regData.name.trim()) errs.name = 'Name is required';
        if (!regData.rollNumber.trim()) errs.rollNumber = 'Roll number is required';
        if (!regData.year) errs.year = 'Select year';
        if (!regData.branch) errs.branch = 'Select branch';
        if (!regData.email.trim()) {
            errs.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regData.email)) {
            errs.email = 'Enter a valid email';
        }
        if (!regData.phone.trim()) {
            errs.phone = 'Phone is required';
        } else if (!/^\d{10}$/.test(regData.phone.trim())) {
            errs.phone = 'Enter a 10-digit number';
        }
        if (!regData.password) {
            errs.password = 'Password is required';
        } else if (regData.password.length < 6) {
            errs.password = 'At least 6 characters';
        }
        return errs;
    };

    // Runs on the registration form: validates the details, fires off the
    // OTP email, then slides across to the dedicated OTP verification card.
    const handleRegSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateReg();
        if (Object.keys(validationErrors).length > 0) {
            setRegErrors(validationErrors);
            return;
        }

        setRegServerError('');
        setRegSuccess('');
        setIsRegLoading(true);

        try {
            const res = await fetch(`${OTP_API_URL}?action=send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: regData.email.trim() }),
            });
            const data = await res.json();

            if (!data.success) {
                setRegServerError(data.error || 'Could not send OTP. Please try again.');
                return;
            }

            setOtpSent(true);
            setOtpValue('');
            setOtpError('');
            setResendCooldown(60);
            setMode('otp');
        } catch (err) {
            setRegServerError('Could not reach the server. Please try again.');
        } finally {
            setIsRegLoading(false);
        }
    };

    return (
        <div className={styles.loginContainer}>
            <div
                className={styles.bgPanel}
                style={{ backgroundImage: `url(${bgImage})` }}
            />

            <div className={styles.formPanel}>
                <div
                    className={styles.authSwitcher}
                    style={switcherHeight ? { height: `${switcherHeight}px` } : undefined}
                >
                    <div
                        className={`${styles.authTrack} ${mode === 'register' ? styles.toRegister : ''} ${mode === 'otp' ? styles.toOtp : ''}`}
                    >
                        {/* ===================== LOGIN CARD ===================== */}
                        <div className={styles.loginCard} ref={loginCardRef}>
                            <div className={styles.brand}>
                                <img src={ccetLogo} alt="CCET Logo" className={styles.badge} />
                                <span className={styles.brandName}>
                                    Chandigarh College of Engineering and Technology
                                </span>
                            </div>

                            <div className={styles.header}>
                                <h1 className={styles.title}>Grievance Portal</h1>
                                <p className={styles.subtitle}>Sign in with your college account</p>
                            </div>

                            <form onSubmit={handleSubmit} className={styles.form} noValidate>
                                <div className={styles.inputGroup}>
                                    <label htmlFor="email" className={styles.label}>
                                        Email Address
                                    </label>
                                    <div className={styles.fieldWrap}>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            onFocus={handleFocus}
                                            placeholder="you@ccet.ac.in"
                                            autoComplete="email"
                                            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                                        />
                                        <span className={styles.fieldIcon}>
                                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
                                                <rect x="3" y="5" width="18" height="14" rx="2" />
                                                <path d="M3 7l9 6 9-6" />
                                            </svg>
                                        </span>
                                    </div>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label htmlFor="password" className={styles.label}>
                                        Password
                                    </label>
                                    <div className={styles.fieldWrap}>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            onFocus={handleFocus}
                                            placeholder="••••••••"
                                            autoComplete="current-password"
                                            className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                                        />
                                        <button
                                            type="button"
                                            className={styles.eyeBtn}
                                            onClick={() => setShowPassword((v) => !v)}
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                            tabIndex={-1}
                                        >
                                            {showPassword ? (
                                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
                                                    <path d="M3 3l18 18" />
                                                    <path d="M10.6 10.6a2 2 0 002.8 2.8" />
                                                    <path d="M9.5 5.2A10.4 10.4 0 0112 5c5 0 9 4 10 7-.4 1.1-1.2 2.4-2.4 3.6M6.4 6.4C4.5 7.7 3 9.6 2 12c1 3 5 7 10 7 1.2 0 2.3-.2 3.4-.6" />
                                                </svg>
                                            ) : (
                                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
                                                    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
                                                    <circle cx="12" cy="12" r="3" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className={styles.options}>
                                    <label className={styles.remember}>
                                        <input type="checkbox" className={styles.checkbox} />
                                        <span>Remember me</span>
                                    </label>
                                    <a href="#" className={styles.link}>
                                        Forgot password?
                                    </a>
                                </div>

                                {serverError && (
                                    <p style={{ color: '#ef4444', fontSize: '13px', margin: 0 }}>
                                        {serverError}
                                    </p>
                                )}

                                <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                                    {isLoading ? <span className={styles.spinner} /> : 'Sign In'}
                                </button>

                                <button type="button" className={styles.switchBtn} onClick={goToRegister}>
                                    New here? Register
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M5 12h14" />
                                        <path d="M13 6l6 6-6 6" />
                                    </svg>
                                </button>
                            </form>

                            <div className={styles.footer}>
                                <p>
                                    Need help?{' '}
                                    <a href="mailto:admin@ccet.ac.in" className={styles.link}>
                                        Contact admin
                                    </a>
                                </p>
                            </div>
                        </div>

                        {/* ===================== REGISTER CARD ===================== */}
                        <div className={styles.registerCard} ref={registerCardRef}>
                            <div className={styles.brand}>
                                <img src={ccetLogo} alt="CCET Logo" className={styles.badge} />
                                <span className={styles.brandName}>
                                    Chandigarh College of Engineering and Technology
                                </span>
                            </div>

                            <div className={styles.header}>
                                <h1 className={styles.title}>Student Registration</h1>
                                <p className={styles.subtitle}>Create your grievance portal account</p>
                            </div>

                            <form onSubmit={handleRegSubmit} className={styles.form} noValidate>
                                <div className={styles.row}>
                                    <div className={styles.inputGroup}>
                                        <label htmlFor="name" className={styles.label}>Name</label>
                                        <div className={styles.fieldWrap}>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={regData.name}
                                                onChange={handleRegChange}
                                                onFocus={handleRegFocus}
                                                placeholder="Full name"
                                                autoComplete="name"
                                                className={`${styles.input} ${regErrors.name ? styles.inputError : ''}`}
                                            />
                                            <span className={styles.fieldIcon}>
                                                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8">
                                                    <circle cx="12" cy="8" r="3.2" />
                                                    <path d="M4.5 20c1.6-3.6 4.7-5.4 7.5-5.4S17.9 16.4 19.5 20" />
                                                </svg>
                                            </span>
                                        </div>
                                    </div>

                                    <div className={styles.inputGroup}>
                                        <label htmlFor="rollNumber" className={styles.label}>Roll Number</label>
                                        <div className={styles.fieldWrap}>
                                            <input
                                                type="text"
                                                id="rollNumber"
                                                name="rollNumber"
                                                value={regData.rollNumber}
                                                onChange={handleRegChange}
                                                onFocus={handleRegFocus}
                                                placeholder="e.g. 22103045"
                                                className={`${styles.input} ${regErrors.rollNumber ? styles.inputError : ''}`}
                                            />
                                            <span className={styles.fieldIcon}>
                                                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8">
                                                    <rect x="3" y="6" width="18" height="12" rx="2" />
                                                    <path d="M7 10h4M7 14h6" />
                                                </svg>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.row}>
                                    <div className={styles.inputGroup}>
                                        <label htmlFor="year" className={styles.label}>Year</label>
                                        <div className={styles.fieldWrap}>
                                            <select
                                                id="year"
                                                name="year"
                                                value={regData.year}
                                                onChange={handleRegChange}
                                                onFocus={handleRegFocus}
                                                className={`${styles.select} ${regErrors.year ? styles.inputError : ''}`}
                                            >
                                                <option value="">Select year</option>
                                                {YEARS.map((y) => (
                                                    <option key={y} value={y}>{y}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className={styles.inputGroup}>
                                        <label htmlFor="branch" className={styles.label}>Branch</label>
                                        <div className={styles.fieldWrap}>
                                            <select
                                                id="branch"
                                                name="branch"
                                                value={regData.branch}
                                                onChange={handleRegChange}
                                                onFocus={handleRegFocus}
                                                className={`${styles.select} ${regErrors.branch ? styles.inputError : ''}`}
                                            >
                                                <option value="">Select branch</option>
                                                {BRANCHES.map((b) => (
                                                    <option key={b} value={b}>{b}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.row}>
                                    <div className={styles.inputGroup}>
                                        <label htmlFor="regEmail" className={styles.label}>College Email</label>
                                        <div className={styles.fieldWrap}>
                                            <input
                                                type="email"
                                                id="regEmail"
                                                name="email"
                                                value={regData.email}
                                                onChange={handleRegChange}
                                                onFocus={handleRegFocus}
                                                placeholder="you@ccet.ac.in"
                                                autoComplete="email"
                                                className={`${styles.input} ${regErrors.email ? styles.inputError : ''}`}
                                            />
                                            <span className={styles.fieldIcon}>
                                                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8">
                                                    <rect x="3" y="5" width="18" height="14" rx="2" />
                                                    <path d="M3 7l9 6 9-6" />
                                                </svg>
                                            </span>
                                        </div>
                                    </div>

                                    <div className={styles.inputGroup}>
                                        <label htmlFor="phone" className={styles.label}>Phone</label>
                                        <div className={styles.fieldWrap}>
                                            <input
                                                type="tel"
                                                id="phone"
                                                name="phone"
                                                value={regData.phone}
                                                onChange={handleRegChange}
                                                onFocus={handleRegFocus}
                                                placeholder="10-digit number"
                                                autoComplete="tel"
                                                className={`${styles.input} ${regErrors.phone ? styles.inputError : ''}`}
                                            />
                                            <span className={styles.fieldIcon}>
                                                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8">
                                                    <path d="M4 4.5c0 8.3 6.7 15 15 15l.5-3.2-4.3-1.5-1.4 1.9c-2.7-1.2-4.9-3.4-6.1-6.1l1.9-1.4L7.1 4H4z" />
                                                </svg>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label htmlFor="regPassword" className={styles.label}>Password</label>
                                    <div className={styles.fieldWrap}>
                                        <input
                                            type={showRegPassword ? 'text' : 'password'}
                                            id="regPassword"
                                            name="password"
                                            value={regData.password}
                                            onChange={handleRegChange}
                                            onFocus={handleRegFocus}
                                            placeholder="••••••••"
                                            autoComplete="new-password"
                                            className={`${styles.input} ${regErrors.password ? styles.inputError : ''}`}
                                        />
                                        <button
                                            type="button"
                                            className={styles.eyeBtn}
                                            onClick={() => setShowRegPassword((v) => !v)}
                                            aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                                            tabIndex={-1}
                                        >
                                            {showRegPassword ? (
                                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
                                                    <path d="M3 3l18 18" />
                                                    <path d="M10.6 10.6a2 2 0 002.8 2.8" />
                                                    <path d="M9.5 5.2A10.4 10.4 0 0112 5c5 0 9 4 10 7-.4 1.1-1.2 2.4-2.4 3.6M6.4 6.4C4.5 7.7 3 9.6 2 12c1 3 5 7 10 7 1.2 0 2.3-.2 3.4-.6" />
                                                </svg>
                                            ) : (
                                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
                                                    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
                                                    <circle cx="12" cy="12" r="3" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {regServerError && (
                                    <p style={{ color: '#ef4444', fontSize: '13px', margin: 0 }}>
                                        {regServerError}
                                    </p>
                                )}
                                {regSuccess && (
                                    <p style={{ color: '#16a34a', fontSize: '13px', margin: 0 }}>
                                        {regSuccess}
                                    </p>
                                )}

                                <button type="submit" className={styles.submitBtn} disabled={isRegLoading}>
                                    {isRegLoading ? <span className={styles.spinner} /> : 'Register'}
                                </button>

                                <button type="button" className={styles.switchBtn} onClick={goToLogin}>
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M19 12H5" />
                                        <path d="M11 6l-6 6 6 6" />
                                    </svg>
                                    Already registered? Login
                                </button>
                            </form>
                        </div>

                        {/* ===================== OTP VERIFICATION CARD ===================== */}
                        <div className={styles.otpCard} ref={otpCardRef}>
                            <div className={styles.brand}>
                                <img src={ccetLogo} alt="CCET Logo" className={styles.badge} />
                                <span className={styles.brandName}>
                                    Chandigarh College of Engineering and Technology
                                </span>
                            </div>

                            <div className={styles.header}>
                                <h1 className={styles.title}>Verify Your Email</h1>
                                <p className={styles.subtitle}>Enter the code we just sent you to finish creating your account</p>
                            </div>

                            <form onSubmit={handleVerifyAndRegister} className={styles.form} noValidate>
                                <div className={styles.otpEmailBadge}>
                                    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8">
                                        <rect x="3" y="5" width="18" height="14" rx="2" />
                                        <path d="M3 7l9 6 9-6" />
                                    </svg>
                                    <span>OTP sent to {regData.email}</span>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label htmlFor="otp" className={styles.label}>
                                        6-Digit Verification Code
                                    </label>
                                    <div className={styles.fieldWrap}>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            id="otp"
                                            name="otp"
                                            value={otpValue}
                                            onChange={handleOtpChange}
                                            placeholder="Enter OTP"
                                            maxLength={6}
                                            autoComplete="one-time-code"
                                            className={styles.input}
                                        />
                                    </div>
                                </div>

                                {otpError && (
                                    <p style={{ color: '#ef4444', fontSize: '13px', margin: 0 }}>
                                        {otpError}
                                    </p>
                                )}
                                {regSuccess && (
                                    <p style={{ color: '#16a34a', fontSize: '13px', margin: 0 }}>
                                        {regSuccess}
                                    </p>
                                )}

                                <button type="submit" className={styles.submitBtn} disabled={otpVerifying || otpValue.length !== 6}>
                                    {otpVerifying ? <span className={styles.spinner} /> : 'Verify & Complete Registration'}
                                </button>

                                <div className={styles.row}>
                                    <button
                                        type="button"
                                        className={styles.switchBtn}
                                        onClick={handleSendOtp}
                                        disabled={otpSending || resendCooldown > 0}
                                    >
                                        {otpSending ? (
                                            <span className={styles.spinner} />
                                        ) : resendCooldown > 0 ? (
                                            `Resend in ${resendCooldown}s`
                                        ) : (
                                            'Resend OTP'
                                        )}
                                    </button>
                                    <button type="button" className={styles.switchBtn} onClick={goBackToRegisterForm}>
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M19 12H5" />
                                            <path d="M11 6l-6 6 6 6" />
                                        </svg>
                                        Back
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}