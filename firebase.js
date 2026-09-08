// ============================================================
//  AyurDash — Firebase Configuration & Initialization
//  firebase.js  (loaded first on every page)
// ============================================================

// ── Firebase SDK (v9 compat via CDN — loaded in HTML) ────────
// All Firebase services accessed via window.firebase globals

const firebaseConfig = {
  apiKey:            "AIzaSyA0IZuFDu1KMTnrmLEFJ9PiIlq4taIAQWQ",
  authDomain:        "ayurdash.firebaseapp.com",
  projectId:         "ayurdash",
  storageBucket:     "ayurdash.firebasestorage.app",
  messagingSenderId: "978024209800",
  appId:             "1:978024209800:web:c7f1bab8c44e5c5e7d2e3d"
};

// Initialize Firebase app (guard against double-init)
if (!firebase.apps || !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// ── Service Shortcuts (used throughout the app) ───────────────
const FB = {
  auth:      firebase.auth(),
  db:        firebase.firestore(),
  storage:   firebase.storage(),

  // Auth providers
  googleProvider: new firebase.auth.GoogleAuthProvider(),

  // Firestore helpers
  FieldValue:    firebase.firestore.FieldValue,
  Timestamp:     firebase.firestore.Timestamp,
  serverTime:    () => firebase.firestore.FieldValue.serverTimestamp(),

  // ── Collection refs ─────────────────────────────────────────
  col: {
    users:         () => firebase.firestore().collection('users'),
    patients:      () => firebase.firestore().collection('patients'),
    doctors:       () => firebase.firestore().collection('doctors'),
    students:      () => firebase.firestore().collection('students'),
    prescriptions: () => firebase.firestore().collection('prescriptions'),
    reminders:     () => firebase.firestore().collection('reminders'),
    dinacharya:    () => firebase.firestore().collection('dinacharya'),
    vegaBouts:     () => firebase.firestore().collection('vegaBouts'),
    chatHistory:   () => firebase.firestore().collection('chatHistory'),
    medicines:     () => firebase.firestore().collection('medicines'),
  },

  // ── Firestore CRUD helpers ───────────────────────────────────
  async setDoc(colName, docId, data) {
    await firebase.firestore().collection(colName).doc(docId).set(data, { merge: true });
  },

  async getDoc(colName, docId) {
    const snap = await firebase.firestore().collection(colName).doc(docId).get();
    return snap.exists ? { id: snap.id, ...snap.data() } : null;
  },

  async addDoc(colName, data) {
    const ref = await firebase.firestore().collection(colName).add({
      ...data, createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return ref.id;
  },

  async updateDoc(colName, docId, data) {
    await firebase.firestore().collection(colName).doc(docId).update({
      ...data, updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  },

  async deleteDoc(colName, docId) {
    await firebase.firestore().collection(colName).doc(docId).delete();
  },

  async queryDocs(colName, field, op, value) {
    const snap = await firebase.firestore().collection(colName).where(field, op, value).get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  // Real-time listener — returns unsubscribe function
  listen(colName, docId, callback) {
    return firebase.firestore().collection(colName).doc(docId)
      .onSnapshot(snap => callback(snap.exists ? { id: snap.id, ...snap.data() } : null));
  },

  listenQuery(colName, field, op, value, callback) {
    return firebase.firestore().collection(colName).where(field, op, value)
      .onSnapshot(snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  },

  // ── Storage helper ───────────────────────────────────────────
  async uploadFile(path, file, onProgress) {
    const ref = firebase.storage().ref(path);
    const task = ref.put(file);
    if (onProgress) task.on('state_changed', snap => onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)));
    await task;
    return await ref.getDownloadURL();
  }
};

console.log('🌿 Firebase initialized — Project: ayurdash');
