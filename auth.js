// ============================================================
//  AyurDash — Authentication Engine  v3.0  (Firebase)
//  auth.js
//
//  Uses Firebase Auth:
//   • Email/Password — createUser, signIn, sendEmailVerification
//   • Google Sign-In — GoogleAuthProvider popup
//   • Phone SMS OTP  — PhoneAuthProvider + reCAPTCHA
//   • Forgot Password — sendPasswordResetEmail
//   • Firestore     — user profile stored in users/{uid}
// ============================================================

"use strict";

const Auth = {

  // ── STATE ─────────────────────────────────────────────────
  currentRole:     null,
  currentScreen:   'role',
  otpChannel:      'email',
  resendTimerInt:  null,
  confirmResult:   null,   // PhoneAuthProvider confirmation
  recaptchaWidget: null,

  // ── BOOT ──────────────────────────────────────────────────
  init() {
    // If already signed in, go straight to app
    FB.auth.onAuthStateChanged(user => {
      if (user) {
        this._resolveUserAndRedirect(user);
      }
    });

    this._setupOtpBoxes('#otpInputs');
    this._setupOtpBoxes('#forgotOtpInputs');

    const pwInput = document.getElementById('signupPassword');
    if (pwInput) pwInput.addEventListener('input', () => this._checkPwStrength(pwInput.value));

    this._checkNotifPermission();
  },

  // ── NAVIGATION ────────────────────────────────────────────
  selectRole(role) {
    this.currentRole = role;
    const roleInfo = {
      patient: { icon: '🧘', label: 'Patient Portal' },
      doctor:  { icon: '🩺', label: 'Physician Portal' },
      student: { icon: '📚', label: 'Student Training Lab' }
    };
    ['loginRoleHeader', 'signupRoleHeader'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = `<span>${roleInfo[role].icon}</span> ${roleInfo[role].label}`;
    });
    document.getElementById('doctorExtraFields').classList.toggle('hidden', role !== 'doctor');
    document.getElementById('studentExtraFields').classList.toggle('hidden', role !== 'student');
    this.goTo('login');
  },

  goTo(screen) {
    document.querySelectorAll('.auth-screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(`screen-${screen}`);
    if (el) el.classList.add('active');
    this.currentScreen = screen;
    ['loginError','signupError','forgotError','otpError','resetError'].forEach(id => {
      const e = document.getElementById(id);
      if (e) { e.textContent = ''; e.classList.add('hidden'); }
    });
  },

  // ── EMAIL / PASSWORD SIGN IN ──────────────────────────────
  async submitLogin() {
    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) { this._err('loginError', 'Please enter email and password.'); return; }
    if (!this._validEmail(email)) { this._err('loginError', 'Enter a valid email address.'); return; }

    this._setLoading('loginBtn', true, 'Signing in...');
    try {
      const cred = await FB.auth.signInWithEmailAndPassword(email, password);
      // Check email verified
      if (!cred.user.emailVerified) {
        await FB.auth.signOut();
        this._err('loginError', '📧 Email not verified. Check your inbox and click the verification link.');
        this._setLoading('loginBtn', false, 'Sign In →');
        return;
      }
      // Fetch role from Firestore
      const profile = await FB.getDoc('users', cred.user.uid);
      if (profile && this.currentRole && profile.role !== this.currentRole) {
        await FB.auth.signOut();
        this._err('loginError', `This account is registered as a ${profile.role}. Please select the correct portal.`);
        this._setLoading('loginBtn', false, 'Sign In →');
        return;
      }
      // Success — onAuthStateChanged will fire and redirect
    } catch (e) {
      this._setLoading('loginBtn', false, 'Sign In →');
      this._err('loginError', this._friendlyError(e.code));
    }
  },

  // ── EMAIL / PASSWORD SIGN UP ──────────────────────────────
  async submitSignup() {
    const first   = document.getElementById('signupFirst').value.trim();
    const last    = document.getElementById('signupLast').value.trim();
    const email   = document.getElementById('signupEmail').value.trim();
    const cc      = document.getElementById('countryCode').value;
    const phone   = cc + document.getElementById('signupPhone').value.replace(/\D/g,'');
    const pw      = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupConfirm').value;
    const terms   = document.getElementById('termsCheck').checked;
    const role    = this.currentRole || 'patient';

    if (!first || !last)          { this._err('signupError', 'Enter your full name.'); return; }
    if (!this._validEmail(email)) { this._err('signupError', 'Enter a valid email address.'); return; }
    if (phone.length < 10)        { this._err('signupError', 'Enter a valid mobile number.'); return; }
    if (pw.length < 8)            { this._err('signupError', 'Password must be at least 8 characters.'); return; }
    if (pw !== confirm)           { this._err('signupError', 'Passwords do not match.'); return; }
    if (!terms)                   { this._err('signupError', 'Accept the Terms of Service to continue.'); return; }

    if (role === 'doctor' && !document.getElementById('medRegNo').value.trim()) {
      this._err('signupError', 'Medical Registration Number is required.'); return;
    }
    if (role === 'student' && !document.getElementById('institution').value.trim()) {
      this._err('signupError', 'Institution name is required.'); return;
    }

    this._setLoading('signupBtn', true, 'Creating account...');

    try {
      // 1. Create Firebase Auth user
      const cred = await FB.auth.createUserWithEmailAndPassword(email, pw);

      // 2. Update display name
      await cred.user.updateProfile({ displayName: `${first} ${last}` });

      // 3. Send email verification
      await cred.user.sendEmailVerification();

      // 4. Save profile to Firestore
      const profile = {
        uid: cred.user.uid,
        role,
        firstName: first,
        lastName: last,
        displayName: `${first} ${last}`,
        email,
        phone,
        verified: false,
        emailVerified: false,
        photoURL: cred.user.photoURL || null,
        specialization: document.getElementById('specialization')?.value.trim() || '',
        institution:    document.getElementById('institution')?.value.trim()    || '',
        studentId:      document.getElementById('studentId')?.value.trim()      || '',
        medRegNo:       document.getElementById('medRegNo')?.value.trim()       || '',
        createdAt: FB.serverTime(),
        prakriti: 'To be assessed',
        bloodGroup: '',
        address: '',
        allergies: [],
        currentMedications: [],
        privacy: { shareAllergies: true, shareTreatments: true, shareMentalHealth: false, shareLabReports: true }
      };
      await FB.setDoc('users', cred.user.uid, profile);

      // 5. Also create role-specific sub-doc
      await FB.setDoc(role === 'patient' ? 'patients' : role === 'doctor' ? 'doctors' : 'students', cred.user.uid, profile);

      // 6. Sign out until email verified
      await FB.auth.signOut();

      this._setLoading('signupBtn', false, 'Create Account →');
      this._showEmailVerificationScreen(email);

    } catch (e) {
      this._setLoading('signupBtn', false, 'Create Account →');
      this._err('signupError', this._friendlyError(e.code));
    }
  },

  _showEmailVerificationScreen(email) {
    this.goTo('otp');
    document.getElementById('otpSubText').textContent =
      `We sent a verification email to ${email}. Click the link in the email, then come back and click Verify below.`;
    document.getElementById('otpTargetDisplay').innerHTML =
      `📧 Check your inbox: <strong>${email}</strong>`;
    document.getElementById('otpInputs').style.display = 'none';
    document.getElementById('otpChannelTabs').style.display = 'none';

    // Show a "I've verified my email" button instead
    const verifyBtn = document.getElementById('otpVerifyBtn');
    if (verifyBtn) {
      verifyBtn.textContent = '✅ I verified my email — Sign In';
      verifyBtn.onclick = () => { this.goTo('login'); document.getElementById('otpInputs').style.display = ''; document.getElementById('otpChannelTabs').style.display = ''; };
    }
    this._showToast('📧 Verification email sent! Check your inbox.');
  },

  // ── PHONE SMS OTP ─────────────────────────────────────────
  async sendPhoneOtp() {
    const cc    = document.getElementById('countryCode').value;
    const phone = cc + document.getElementById('signupPhone').value.replace(/\D/g,'');
    if (phone.length < 10) { this._err('signupError', 'Enter a valid phone number first.'); return; }

    try {
      // Initialize reCAPTCHA verifier (invisible)
      if (!this.recaptchaWidget) {
        this.recaptchaWidget = new firebase.auth.RecaptchaVerifier('recaptchaContainer', {
          size: 'invisible',
          callback: () => {}
        });
      }
      this.confirmResult = await FB.auth.signInWithPhoneNumber(phone, this.recaptchaWidget);
      this._showSmsOtpInput(phone);
      this._showToast(`📱 SMS sent to ${phone}`);
    } catch (e) {
      this._err('signupError', this._friendlyError(e.code));
    }
  },

  _showSmsOtpInput(phone) {
    this.goTo('otp');
    this.otpChannel = 'sms';
    document.getElementById('otpSubText').textContent = `Enter the 6-digit SMS code sent to ${phone}`;
    document.getElementById('otpTargetDisplay').innerHTML = `📱 SMS sent to <strong>${phone}</strong>`;
    document.getElementById('otpInputs').style.display = '';
    const verifyBtn = document.getElementById('otpVerifyBtn');
    if (verifyBtn) { verifyBtn.textContent = '✔ Verify SMS Code'; verifyBtn.onclick = () => this.verifySmsOtp(); }
    this._startResendTimer();
    this._setupOtpBoxes('#otpInputs');
    setTimeout(() => { const b = document.querySelector('#otpInputs .otp-box'); if (b) b.focus(); }, 100);
  },

  async verifySmsOtp() {
    if (!this.confirmResult) { this._err('otpError', 'No OTP session. Please resend.'); return; }
    const boxes   = document.querySelectorAll('#otpInputs .otp-box');
    const entered = Array.from(boxes).map(b => b.value).join('');
    if (entered.length < 6) { this._err('otpError', 'Enter all 6 digits.'); return; }

    this._setLoading('otpVerifyBtn', true, 'Verifying...');
    try {
      const cred = await this.confirmResult.confirm(entered);
      boxes.forEach(b => b.classList.add('filled'));
      this._setLoading('otpVerifyBtn', false, '✔ Verified');
      this._showToast('✅ Phone verified!');
      // Phone verified — now show success
      setTimeout(() => this._resolveUserAndRedirect(cred.user), 800);
    } catch (e) {
      this._setLoading('otpVerifyBtn', false, '✔ Verify SMS Code');
      boxes.forEach(b => b.classList.add('error'));
      setTimeout(() => boxes.forEach(b => b.classList.remove('error')), 800);
      this._err('otpError', 'Incorrect code. Try again.');
    }
  },

  // ── GOOGLE SIGN IN ────────────────────────────────────────
  async googleSignIn() {
    this.goTo('google');
    document.querySelector('.google-loading').classList.remove('hidden');
    document.getElementById('googleAccountPicker').classList.add('hidden');

    try {
      FB.googleProvider.setCustomParameters({ prompt: 'select_account' });
      const result = await FB.auth.signInWithPopup(FB.googleProvider);
      const user   = result.user;

      // Check if profile exists in Firestore
      let profile = await FB.getDoc('users', user.uid);
      if (!profile) {
        // New Google user — save profile, ask for role if not set
        const role = this.currentRole || 'patient';
        const nameParts = (user.displayName || 'User').split(' ');
        profile = {
          uid: user.uid,
          role,
          firstName: nameParts[0],
          lastName: nameParts.slice(1).join(' '),
          displayName: user.displayName,
          email: user.email,
          phone: user.phoneNumber || '',
          verified: true,
          emailVerified: true,
          photoURL: user.photoURL,
          createdAt: FB.serverTime(),
          prakriti: 'To be assessed',
          allergies: [],
          currentMedications: [],
          privacy: { shareAllergies: true, shareTreatments: true, shareMentalHealth: false, shareLabReports: true }
        };
        await FB.setDoc('users', user.uid, profile);
        await FB.setDoc(role === 'patient' ? 'patients' : role === 'doctor' ? 'doctors' : 'students', user.uid, profile);
      }
      // Role mismatch check
      if (this.currentRole && profile.role !== this.currentRole) {
        await FB.auth.signOut();
        this.goTo('login');
        this._err('loginError', `This Google account is registered as a ${profile.role}. Select the correct portal.`);
        return;
      }
      this._completeAuth(user, profile);
    } catch (e) {
      this.goTo('login');
      if (e.code !== 'auth/popup-closed-by-user' && e.code !== 'auth/cancelled-popup-request') {
        this._err('loginError', this._friendlyError(e.code));
      }
    }
  },

  // ── FORGOT PASSWORD ───────────────────────────────────────
  async sendForgotOtp() {
    const contact = document.getElementById('forgotContact').value.trim();
    if (!contact) { this._err('forgotError', 'Enter your email address.'); return; }
    if (!this._validEmail(contact)) { this._err('forgotError', 'Enter a valid email address.'); return; }

    this._setLoading('forgotBtn', true, 'Sending...');
    try {
      await FB.auth.sendPasswordResetEmail(contact);
      this._setLoading('forgotBtn', false, '📤 Send Reset Email');
      document.getElementById('forgotOtpSection').classList.remove('hidden');
      document.getElementById('forgotDemoHint').style.display = 'block';
      document.getElementById('forgotOtpHintVal').textContent = 'Check your email inbox';
      this._showToast(`📧 Password reset email sent to ${contact}`);
      this._err('forgotError', ''); // clear
      // Show message
      const sec = document.getElementById('forgotOtpSection');
      sec.innerHTML = `
        <div class="auth-success">
          ✅ Password reset email sent to <strong>${contact}</strong>.<br/>
          Click the link in the email to set a new password, then come back to sign in.
        </div>
        <button class="btn btn-primary btn-full mt-12" onclick="Auth.goTo('login')">← Back to Sign In</button>
      `;
    } catch (e) {
      this._setLoading('forgotBtn', false, '📤 Send Reset Email');
      this._err('forgotError', this._friendlyError(e.code));
    }
  },

  // ── AUTH STATE RESOLUTION ─────────────────────────────────
  async _resolveUserAndRedirect(user) {
    try {
      let profile = await FB.getDoc('users', user.uid);
      if (!profile) {
        // Edge case: auth exists but no Firestore profile — use defaults
        profile = { role: this.currentRole || 'patient', displayName: user.displayName || 'User' };
        await FB.setDoc('users', user.uid, { ...profile, uid: user.uid, email: user.email, createdAt: FB.serverTime() });
      }
      this._completeAuth(user, profile);
    } catch (e) {
      console.error('Profile fetch error:', e);
      this._completeAuth(user, { role: this.currentRole || 'patient', displayName: user.displayName });
    }
  },

  _completeAuth(user, profile) {
    // Save session to sessionStorage + localStorage
    const session = {
      uid:   user.uid,
      role:  profile.role || this.currentRole || 'patient',
      name:  profile.displayName || user.displayName || 'User',
      email: profile.email || user.email,
      photoURL: profile.photoURL || user.photoURL || null,
      ts: Date.now()
    };
    sessionStorage.setItem('ayurdash_role',    session.role);
    sessionStorage.setItem('ayurdash_userid',  session.uid);
    sessionStorage.setItem('ayurdash_name',    session.name);
    localStorage.setItem('ayurdash_session',   JSON.stringify(session));

    // Show success screen then redirect
    this.goTo('success');
    const msg = document.getElementById('successMsg');
    if (msg) msg.textContent = `Welcome, ${session.name.split(' ')[0]}! Loading your ${session.role} dashboard...`;
    setTimeout(() => {
      const bar = document.getElementById('progressBarFill');
      if (bar) bar.style.width = '100%';
    }, 100);
    setTimeout(() => { window.location.replace('index.html'); }, 3000);
  },

  // ── OTP RESEND TIMER ──────────────────────────────────────
  _startResendTimer() {
    if (this.resendTimerInt) clearInterval(this.resendTimerInt);
    let secs = 60;
    const timerEl   = document.getElementById('resendTimer');
    const countdown = document.getElementById('resendCountdown');
    const resendBtn = document.getElementById('resendBtn');
    if (timerEl) timerEl.textContent = secs;
    if (countdown) countdown.classList.remove('hidden');
    if (resendBtn) resendBtn.classList.add('hidden');
    this.resendTimerInt = setInterval(() => {
      secs--;
      if (timerEl) timerEl.textContent = secs;
      if (secs <= 0) {
        clearInterval(this.resendTimerInt);
        if (countdown) countdown.classList.add('hidden');
        if (resendBtn) resendBtn.classList.remove('hidden');
      }
    }, 1000);
  },

  resendOtp() {
    this._showToast('Resending code...');
    this._startResendTimer();
  },

  switchOtpTab(channel) {
    this.otpChannel = channel;
    document.getElementById('tabEmail').classList.toggle('active', channel === 'email');
    document.getElementById('tabSms').classList.toggle('active', channel === 'sms');
  },

  verifyOtp() {
    // Email verification flow — just redirect to login
    this.goTo('login');
  },

  // ── OTP INPUT SETUP ───────────────────────────────────────
  _setupOtpBoxes(selector) {
    const boxes = document.querySelectorAll(`${selector} .otp-box`);
    boxes.forEach((box, i) => {
      box.addEventListener('input', e => {
        box.value = e.target.value.replace(/\D/g,'').slice(-1);
        box.classList.toggle('filled', !!box.value);
        if (box.value && i < boxes.length - 1) boxes[i+1].focus();
      });
      box.addEventListener('keydown', e => {
        if (e.key === 'Backspace' && !box.value && i > 0) { boxes[i-1].focus(); boxes[i-1].value=''; boxes[i-1].classList.remove('filled'); }
        if (e.key === 'ArrowLeft'  && i > 0)              boxes[i-1].focus();
        if (e.key === 'ArrowRight' && i < boxes.length-1) boxes[i+1].focus();
      });
      box.addEventListener('paste', e => {
        e.preventDefault();
        const pasted = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g,'');
        boxes.forEach((b,j) => { b.value = pasted[j]||''; b.classList.toggle('filled', !!b.value); });
        boxes[Math.min(pasted.length, boxes.length-1)].focus();
      });
    });
  },

  // ── PASSWORD HELPERS ──────────────────────────────────────
  togglePw(id, btn) {
    const el = document.getElementById(id);
    if (!el) return;
    el.type = el.type === 'text' ? 'password' : 'text';
    btn.textContent = el.type === 'text' ? '🙈' : '👁';
  },

  _checkPwStrength(pw) {
    const bar = document.getElementById('pwStrengthBar');
    const lbl = document.getElementById('pwStrengthLabel');
    if (!bar || !lbl) return;
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    const levels = [
      { w:'0%',   c:'#e5e7eb', l:'',          lc:'#9ca3af' },
      { w:'25%',  c:'#dc3545', l:'Weak',       lc:'#dc3545' },
      { w:'50%',  c:'#f59e0b', l:'Fair',       lc:'#f59e0b' },
      { w:'75%',  c:'#3b82f6', l:'Good',       lc:'#3b82f6' },
      { w:'100%', c:'#2d6a4f', l:'Strong ✅',  lc:'#2d6a4f' }
    ];
    const lv = levels[s] || levels[0];
    bar.style.setProperty('--pw-w', lv.w);
    bar.style.setProperty('--pw-color', lv.c);
    lbl.textContent = lv.l;
    lbl.style.color = lv.lc;
  },

  // ── NOTIFICATION PERMISSION ───────────────────────────────
  async _checkNotifPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  },

  // ── UI HELPERS ────────────────────────────────────────────
  _err(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    if (!msg) { el.classList.add('hidden'); return; }
    el.textContent = msg;
    el.classList.remove('hidden');
  },

  _setLoading(btnId, loading, label) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.disabled = loading;
    btn.textContent = label;
  },

  _validEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); },

  _friendlyError(code) {
    const map = {
      'auth/user-not-found':          '❌ No account found with this email.',
      'auth/wrong-password':          '❌ Incorrect password. Try again.',
      'auth/email-already-in-use':    '❌ An account already exists with this email.',
      'auth/weak-password':           '❌ Password must be at least 6 characters.',
      'auth/invalid-email':           '❌ Invalid email address.',
      'auth/too-many-requests':       '⚠️ Too many attempts. Please wait a few minutes.',
      'auth/network-request-failed':  '🌐 Network error. Check your internet connection.',
      'auth/popup-blocked':           '⚠️ Popup blocked. Allow popups for this site.',
      'auth/invalid-phone-number':    '❌ Invalid phone number format.',
      'auth/invalid-verification-code': '❌ Incorrect OTP code.',
      'auth/code-expired':            '⏰ Code expired. Please resend.',
      'auth/quota-exceeded':          '⚠️ SMS quota exceeded. Try email verification.',
      'auth/user-disabled':           '❌ This account has been disabled.',
    };
    return map[code] || `❌ Error: ${code}`;
  },

  _showToast(msg) {
    const t = document.getElementById('authToast');
    if (!t) return;
    t.textContent = msg;
    t.classList.remove('hidden');
    setTimeout(() => t.classList.add('hidden'), 4000);
  },

  showTerms()    { this._showToast('Terms: AyurDash is for informational use. Consult a licensed physician for medical decisions.'); },
  showPrivacy()  { this._showToast('Privacy: Your data is encrypted and stored securely in Firebase. Never sold to third parties.'); },
  googleAddAccount() { this.googleSignIn(); }
};

document.addEventListener('DOMContentLoaded', () => Auth.init());
