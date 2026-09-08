// ============================================================
//  AyurDash — Authentication Engine
//  auth.js
//
//  Features:
//   • Role selection (Patient / Doctor / Student)
//   • Email + Password Sign In with validation
//   • Email + Password Sign Up with strength meter
//   • Google Sign-In simulation (account picker UI)
//   • OTP verification via Email channel (simulated send)
//   • OTP verification via SMS channel (simulated send)
//   • 6-box OTP input with auto-advance + backspace
//   • 60-second resend countdown
//   • Forgot Password with reset-code flow
//   • "Remember Me" with localStorage session
//   • Role-specific extra fields (Doctor: Reg No; Student: ID)
//   • Password strength meter
//   • Password visibility toggle
//   • Form validation with inline error messages
//   • Session persistence — auto-login if session exists
//   • Redirect to index.html after successful auth
// ============================================================

"use strict";

const Auth = {

  // ── STATE ─────────────────────────────────────────────────
  currentRole: null,
  currentScreen: 'role',
  pendingUser: null,       // user object being registered
  otpChannel: 'email',    // 'email' | 'sms'
  generatedOtp: null,
  forgotOtp: null,
  resendTimer: null,
  otpContext: 'signup',   // 'signup' | 'login-2fa'

  // Demo accounts — simulates a backend user database
  accounts: [
    { id: 'P001', role: 'patient', firstName: 'Arjun',   lastName: 'Sharma',   email: 'patient@ayurdash.com',  phone: '+919876543210', password: 'Patient@123', verified: true,  googleId: null },
    { id: 'D001', role: 'doctor',  firstName: 'Dr. Meera', lastName: 'Nair',  email: 'doctor@ayurdash.com',   phone: '+919123456789', password: 'Doctor@123',  verified: true,  googleId: null },
    { id: 'S001', role: 'student', firstName: 'Aditya',  lastName: 'Rao',     email: 'student@ayurdash.com',  phone: '+919000001111', password: 'Student@123', verified: true,  googleId: null },
  ],

  googleProfiles: [
    { name: 'Arjun Sharma',   email: 'arjun.sharma@gmail.com',  avatar: 'AS' },
    { name: 'Priya Venkatesh',email: 'priya.v@gmail.com',       avatar: 'PV' },
    { name: 'Meera Nair',     email: 'meera.nair@gmail.com',    avatar: 'MN' },
  ],

  // ── BOOT ──────────────────────────────────────────────────
  init() {
    // Check for existing session
    const session = this._getSession();
    if (session && session.role && session.userId) {
      // Auto-login: skip auth and go straight to app
      this._redirectToApp(session.role, session.userId);
      return;
    }
    // Setup OTP input auto-advance
    this._setupOtpBoxes('#otpInputs');
    this._setupOtpBoxes('#forgotOtpInputs');
    // Setup password strength meter
    const pwInput = document.getElementById('signupPassword');
    if (pwInput) pwInput.addEventListener('input', () => this._checkPwStrength(pwInput.value));
  },

  // ── NAVIGATION ────────────────────────────────────────────
  selectRole(role) {
    this.currentRole = role;
    const roleInfo = {
      patient: { icon: '🧘', label: 'Patient Portal' },
      doctor:  { icon: '🩺', label: 'Physician Portal' },
      student: { icon: '📚', label: 'Student Training Lab' }
    };
    // Update role header on both login and signup screens
    ['loginRoleHeader','signupRoleHeader'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = `<span>${roleInfo[role].icon}</span> ${roleInfo[role].label}`;
    });
    // Show/hide role-specific extra fields
    document.getElementById('doctorExtraFields').classList.toggle('hidden', role !== 'doctor');
    document.getElementById('studentExtraFields').classList.toggle('hidden', role !== 'student');
    this.goTo('login');
  },

  goTo(screen) {
    document.querySelectorAll('.auth-screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(`screen-${screen}`);
    if (el) el.classList.add('active');
    this.currentScreen = screen;
    // Clear errors
    ['loginError','signupError','forgotError','otpError','resetError'].forEach(id => {
      const e = document.getElementById(id);
      if (e) { e.textContent = ''; e.classList.add('hidden'); }
    });
  },

  // ── SIGN IN ───────────────────────────────────────────────
  submitLogin() {
    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const remember = document.getElementById('rememberMe').checked;

    if (!email || !password) { this._loginErr('Please enter email and password.'); return; }
    if (!this._validEmail(email)) { this._loginErr('Please enter a valid email address.'); return; }

    // Find account
    const account = this.accounts.find(a => a.email.toLowerCase() === email.toLowerCase());
    if (!account) { this._loginErr('No account found with this email. Please sign up first.'); return; }
    if (account.password !== password) { this._loginErr('Incorrect password. Please try again.'); return; }
    if (!account.verified) { this._loginErr('Account not verified. Please complete OTP verification.'); return; }
    if (this.currentRole && account.role !== this.currentRole) {
      this._loginErr(`This account is registered as a ${account.role}. Please select the correct portal.`); return;
    }

    // Success — trigger 2FA OTP on login
    this.pendingUser = account;
    this.otpContext  = 'login-2fa';
    this._sendOtp(account.email, account.phone);
    this._showOtpScreen(account.email, account.phone);
    if (remember) this._saveSession(account);
  },

  _loginErr(msg) {
    const el = document.getElementById('loginError');
    el.textContent = msg; el.classList.remove('hidden');
  },

  // ── SIGN UP ───────────────────────────────────────────────
  submitSignup() {
    const first    = document.getElementById('signupFirst').value.trim();
    const last     = document.getElementById('signupLast').value.trim();
    const email    = document.getElementById('signupEmail').value.trim();
    const phone    = (document.getElementById('countryCode').value + document.getElementById('signupPhone').value).replace(/\s/g,'');
    const pw       = document.getElementById('signupPassword').value;
    const confirm  = document.getElementById('signupConfirm').value;
    const terms    = document.getElementById('termsCheck').checked;
    const role     = this.currentRole || 'patient';

    // Validations
    if (!first || !last)         { this._signupErr('Please enter your full name.'); return; }
    if (!this._validEmail(email)){ this._signupErr('Please enter a valid email address.'); return; }
    if (phone.length < 10)       { this._signupErr('Please enter a valid mobile number.'); return; }
    if (pw.length < 8)           { this._signupErr('Password must be at least 8 characters.'); return; }
    if (pw !== confirm)          { this._signupErr('Passwords do not match.'); return; }
    if (!terms)                  { this._signupErr('Please accept the Terms of Service to continue.'); return; }

    // Check duplicate email
    if (this.accounts.find(a => a.email.toLowerCase() === email.toLowerCase())) {
      this._signupErr('An account with this email already exists. Please sign in.'); return;
    }

    // Role-specific validation
    if (role === 'doctor') {
      const reg = document.getElementById('medRegNo').value.trim();
      if (!reg) { this._signupErr('Medical Registration Number is required for Physician accounts.'); return; }
    }
    if (role === 'student') {
      const inst = document.getElementById('institution').value.trim();
      if (!inst) { this._signupErr('Institution name is required for Student accounts.'); return; }
    }

    // Create pending user
    this.pendingUser = {
      id: role[0].toUpperCase() + Date.now().toString(36).toUpperCase(),
      role, firstName: first, lastName: last, email, phone,
      password: pw, verified: false, googleId: null,
      specialization: document.getElementById('specialization')?.value || '',
      institution: document.getElementById('institution')?.value || '',
      studentId: document.getElementById('studentId')?.value || '',
      medRegNo: document.getElementById('medRegNo')?.value || ''
    };
    this.otpContext = 'signup';
    this._sendOtp(email, phone);
    this._showOtpScreen(email, phone);
  },

  _signupErr(msg) {
    const el = document.getElementById('signupError');
    el.textContent = msg; el.classList.remove('hidden');
  },

  // ── GOOGLE SIGN IN ────────────────────────────────────────
  googleSignIn() {
    this.goTo('google');
    const loadText = document.getElementById('googleLoadText');
    const picker   = document.getElementById('googleAccountPicker');
    const list     = document.getElementById('googleAccountsList');

    // Simulate Google OAuth loading
    setTimeout(() => {
      if (loadText) loadText.textContent = 'Checking your Google account...';
    }, 600);
    setTimeout(() => {
      document.querySelector('.google-loading').classList.add('hidden');
      picker.classList.remove('hidden');
      list.innerHTML = this.googleProfiles.map(p => `
        <div class="google-account-item" onclick="Auth.googleSelectAccount('${p.email}', '${p.name}')">
          <div class="google-avatar">${p.avatar}</div>
          <div>
            <div class="google-account-name">${p.name}</div>
            <div class="google-account-email">${p.email}</div>
          </div>
        </div>`).join('');
    }, 1800);
  },

  googleSelectAccount(email, name) {
    const role = this.currentRole || 'patient';
    const [firstName, ...rest] = name.split(' ');
    const lastName = rest.join(' ');

    // Check if existing Google account
    let account = this.accounts.find(a => a.email === email);
    if (!account) {
      // Auto-register via Google
      account = {
        id: role[0].toUpperCase() + Date.now().toString(36).toUpperCase(),
        role, firstName, lastName, email, phone: '', password: '',
        verified: true, googleId: email
      };
      this.accounts.push(account);
    }
    this.pendingUser = account;
    // Google accounts skip OTP — go straight to success
    this._completeAuth(account);
  },

  googleAddAccount() {
    this._showToast('Opening Google sign-in... (simulated in demo)');
    setTimeout(() => this.googleSelectAccount('new.user@gmail.com', 'New User'), 1500);
  },

  // ── OTP SYSTEM ────────────────────────────────────────────
  _generateOtp() {
    return String(Math.floor(100000 + Math.random() * 900000));
  },

  _sendOtp(email, phone) {
    this.generatedOtp = this._generateOtp();
    console.log(`[AyurDash OTP] Code: ${this.generatedOtp} → Email: ${email} | SMS: ${phone}`);

    // In production: call backend API here
    // fetch('/api/send-otp', { method:'POST', body: JSON.stringify({ email, phone, otp: this.generatedOtp }) })

    // Demo: show OTP hint
    const hint = document.getElementById('demoOtpHint');
    if (hint) hint.textContent = this.generatedOtp;

    this._showToast(`📧 OTP sent to ${email} | 📱 SMS sent to ${phone}`);
  },

  _showOtpScreen(email, phone) {
    this._clearOtpBoxes('#otpInputs');
    this.goTo('otp');

    // Update sub text
    const masked_email = email.replace(/(.{2})(.+)(@.+)/, '$1***$3');
    const masked_phone = phone.slice(0, -4).replace(/./g, '*') + phone.slice(-4);
    document.getElementById('otpSubText').textContent =
      `A 6-digit code has been sent to your email and mobile number.`;
    this._setOtpTarget(email, phone);
    this._startResendTimer();

    // Focus first box
    setTimeout(() => {
      const boxes = document.querySelectorAll('#otpInputs .otp-box');
      if (boxes[0]) boxes[0].focus();
    }, 100);
  },

  _setOtpTarget(email, phone) {
    const masked_email = email.replace(/(.{2})(.*)(@.+)/, (_, a, b, c) => a + '*'.repeat(Math.max(b.length,3)) + c);
    const masked_phone = phone.length > 4 ? '*'.repeat(phone.length - 4) + phone.slice(-4) : phone;
    const el = document.getElementById('otpTargetDisplay');
    if (!el) return;
    if (this.otpChannel === 'email') {
      el.innerHTML = `📧 Code sent to <strong>${masked_email}</strong>`;
    } else {
      el.innerHTML = `📱 Code sent to <strong>${masked_phone}</strong>`;
    }
  },

  switchOtpTab(channel) {
    this.otpChannel = channel;
    document.getElementById('tabEmail').classList.toggle('active', channel === 'email');
    document.getElementById('tabSms').classList.toggle('active', channel === 'sms');
    if (this.pendingUser) {
      this._setOtpTarget(this.pendingUser.email || '', this.pendingUser.phone || '');
    }
    // Resend OTP for new channel
    if (this.pendingUser) this._sendOtp(this.pendingUser.email, this.pendingUser.phone);
    this._startResendTimer();
  },

  verifyOtp() {
    const boxes = document.querySelectorAll('#otpInputs .otp-box');
    const entered = Array.from(boxes).map(b => b.value).join('');

    if (entered.length < 6) {
      this._otpErr('Please enter all 6 digits.'); return;
    }
    if (entered !== this.generatedOtp) {
      boxes.forEach(b => b.classList.add('error'));
      setTimeout(() => boxes.forEach(b => b.classList.remove('error')), 800);
      this._otpErr('Incorrect OTP. Please check and try again.'); return;
    }

    // OTP correct
    boxes.forEach(b => { b.classList.add('filled'); b.classList.remove('error'); });
    const successEl = document.getElementById('otpSuccess');
    if (successEl) { successEl.textContent = '✅ OTP verified successfully!'; successEl.classList.remove('hidden'); }

    if (this.pendingUser) {
      this.pendingUser.verified = true;
      if (this.otpContext === 'signup') this.accounts.push(this.pendingUser);
      setTimeout(() => this._completeAuth(this.pendingUser), 800);
    }
  },

  _otpErr(msg) {
    const el = document.getElementById('otpError');
    if (el) { el.textContent = msg; el.classList.remove('hidden'); }
  },

  resendOtp() {
    if (!this.pendingUser) return;
    this._sendOtp(this.pendingUser.email, this.pendingUser.phone);
    this._clearOtpBoxes('#otpInputs');
    this._startResendTimer();
    const err = document.getElementById('otpError');
    if (err) err.classList.add('hidden');
  },

  _startResendTimer() {
    if (this.resendTimer) clearInterval(this.resendTimer);
    let secs = 60;
    const timerEl   = document.getElementById('resendTimer');
    const countdown = document.getElementById('resendCountdown');
    const resendBtn = document.getElementById('resendBtn');
    if (timerEl) timerEl.textContent = secs;
    if (countdown) countdown.classList.remove('hidden');
    if (resendBtn) resendBtn.classList.add('hidden');

    this.resendTimer = setInterval(() => {
      secs--;
      if (timerEl) timerEl.textContent = secs;
      if (secs <= 0) {
        clearInterval(this.resendTimer);
        if (countdown) countdown.classList.add('hidden');
        if (resendBtn) resendBtn.classList.remove('hidden');
      }
    }, 1000);
  },

  // ── FORGOT PASSWORD ───────────────────────────────────────
  sendForgotOtp() {
    const contact = document.getElementById('forgotContact').value.trim();
    if (!contact) { this._forgotErr('Please enter your email or phone number.'); return; }

    const account = this.accounts.find(a =>
      a.email.toLowerCase() === contact.toLowerCase() || a.phone === contact
    );
    if (!account) { this._forgotErr('No account found with this email or phone.'); return; }

    this.forgotOtp = this._generateOtp();
    this.pendingUser = account;
    console.log(`[AyurDash RESET OTP] ${this.forgotOtp} → ${contact}`);

    const hintEl = document.getElementById('forgotOtpHintVal');
    const hintWrap = document.getElementById('forgotDemoHint');
    if (hintEl) hintEl.textContent = this.forgotOtp;
    if (hintWrap) hintWrap.style.display = 'block';

    document.getElementById('forgotOtpSection').classList.remove('hidden');
    this._setupOtpBoxes('#forgotOtpInputs');
    this._showToast(`📧 Reset code sent to ${contact}`);
    const err = document.getElementById('forgotError');
    if (err) err.classList.add('hidden');
  },

  resetPassword() {
    const boxes = document.querySelectorAll('#forgotOtpInputs .otp-box');
    const entered = Array.from(boxes).map(b => b.value).join('');
    const newPw  = document.getElementById('newPassword').value;
    const confPw = document.getElementById('confirmNewPassword').value;

    if (entered.length < 6)           { this._resetErr('Enter the 6-digit reset code.'); return; }
    if (entered !== this.forgotOtp)   { this._resetErr('Invalid reset code.'); return; }
    if (newPw.length < 8)             { this._resetErr('Password must be at least 8 characters.'); return; }
    if (newPw !== confPw)             { this._resetErr('Passwords do not match.'); return; }

    // Update password
    if (this.pendingUser) {
      const acct = this.accounts.find(a => a.id === this.pendingUser.id);
      if (acct) acct.password = newPw;
    }
    this._showToast('✅ Password reset successfully!');
    setTimeout(() => this.goTo('login'), 1500);
  },

  _forgotErr(msg) { const e = document.getElementById('forgotError'); if (e) { e.textContent = msg; e.classList.remove('hidden'); } },
  _resetErr(msg)  { const e = document.getElementById('resetError');  if (e) { e.textContent = msg; e.classList.remove('hidden'); } },

  // ── COMPLETE AUTH ─────────────────────────────────────────
  _completeAuth(account) {
    this._saveSession(account);
    this.goTo('success');
    const msg = document.getElementById('successMsg');
    if (msg) msg.textContent = `Welcome, ${account.firstName}! Redirecting to your ${account.role} dashboard...`;

    // Animate progress bar
    setTimeout(() => {
      const bar = document.getElementById('progressBarFill');
      if (bar) bar.style.width = '100%';
    }, 100);

    // Redirect after 3 seconds
    setTimeout(() => this._redirectToApp(account.role, account.id), 3200);
  },

  _redirectToApp(role, userId) {
    // Pass role + userId via sessionStorage for app.js to read
    sessionStorage.setItem('ayurdash_role',   role);
    sessionStorage.setItem('ayurdash_userid', userId);
    window.location.href = 'index.html';
  },

  // ── SESSION ───────────────────────────────────────────────
  _saveSession(account) {
    const session = { role: account.role, userId: account.id, name: account.firstName + ' ' + account.lastName, email: account.email, ts: Date.now() };
    localStorage.setItem('ayurdash_session', JSON.stringify(session));
    sessionStorage.setItem('ayurdash_role',   account.role);
    sessionStorage.setItem('ayurdash_userid', account.id);
  },

  _getSession() {
    try {
      const s = localStorage.getItem('ayurdash_session');
      if (!s) return null;
      const session = JSON.parse(s);
      // Session expires after 7 days
      if (Date.now() - session.ts > 7 * 24 * 60 * 60 * 1000) {
        localStorage.removeItem('ayurdash_session');
        return null;
      }
      return session;
    } catch (_) { return null; }
  },

  clearSession() {
    localStorage.removeItem('ayurdash_session');
    sessionStorage.removeItem('ayurdash_role');
    sessionStorage.removeItem('ayurdash_userid');
  },

  // ── OTP INPUT SETUP ───────────────────────────────────────
  _setupOtpBoxes(selector) {
    const boxes = document.querySelectorAll(`${selector} .otp-box`);
    boxes.forEach((box, i) => {
      box.addEventListener('input', (e) => {
        const val = e.target.value.replace(/\D/g, '');
        box.value = val.slice(-1);
        box.classList.toggle('filled', !!box.value);
        if (box.value && i < boxes.length - 1) boxes[i + 1].focus();
      });
      box.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !box.value && i > 0) { boxes[i - 1].focus(); boxes[i - 1].value = ''; boxes[i-1].classList.remove('filled'); }
        if (e.key === 'ArrowLeft'  && i > 0) boxes[i - 1].focus();
        if (e.key === 'ArrowRight' && i < boxes.length - 1) boxes[i + 1].focus();
      });
      box.addEventListener('paste', (e) => {
        e.preventDefault();
        const pasted = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
        boxes.forEach((b, j) => { b.value = pasted[j] || ''; b.classList.toggle('filled', !!b.value); });
        const next = boxes[Math.min(pasted.length, boxes.length - 1)];
        if (next) next.focus();
      });
    });
  },

  _clearOtpBoxes(selector) {
    document.querySelectorAll(`${selector} .otp-box`).forEach(b => {
      b.value = ''; b.classList.remove('filled', 'error');
    });
  },

  // ── PASSWORD HELPERS ──────────────────────────────────────
  togglePw(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isText = input.type === 'text';
    input.type = isText ? 'password' : 'text';
    btn.textContent = isText ? '👁' : '🙈';
  },

  _checkPwStrength(pw) {
    const bar   = document.getElementById('pwStrengthBar');
    const label = document.getElementById('pwStrengthLabel');
    if (!bar || !label) return;
    let score = 0;
    if (pw.length >= 8)  score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    const levels = [
      { w: '0%',   color: '#e5e7eb', label: '',        labelColor: '#9ca3af' },
      { w: '25%',  color: '#dc3545', label: 'Weak',    labelColor: '#dc3545' },
      { w: '50%',  color: '#f59e0b', label: 'Fair',    labelColor: '#f59e0b' },
      { w: '75%',  color: '#3b82f6', label: 'Good',    labelColor: '#3b82f6' },
      { w: '100%', color: '#2d6a4f', label: 'Strong ✅', labelColor: '#2d6a4f' }
    ];
    const l = levels[score] || levels[0];
    bar.style.setProperty('--pw-w', l.w);
    bar.style.setProperty('--pw-color', l.color);
    label.textContent = l.label;
    label.style.color = l.labelColor;
  },

  // ── VALIDATION ────────────────────────────────────────────
  _validEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  // ── TERMS / PRIVACY (modal stubs) ─────────────────────────
  showTerms() {
    this._showToast('Terms of Service: AyurDash is for informational purposes. Always consult a licensed Ayurvedic physician for medical decisions.');
  },
  showPrivacy() {
    this._showToast('Privacy Policy: Your health data is stored locally and never shared without your explicit consent.');
  },

  // ── TOAST ─────────────────────────────────────────────────
  _showToast(msg) {
    const t = document.getElementById('authToast');
    if (!t) return;
    t.textContent = msg;
    t.classList.remove('hidden');
    setTimeout(() => t.classList.add('hidden'), 4000);
  }
};

// ── BOOT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => Auth.init());
