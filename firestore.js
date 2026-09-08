// ============================================================
//  AyurDash — Firestore Data Layer
//  firestore.js
//
//  All app data read/write operations
//  Collections: users, patients, doctors, prescriptions,
//               reminders, dinacharya, vegaBouts, chatHistory
// ============================================================

"use strict";

const Store = {

  // ── USER PROFILE ──────────────────────────────────────────
  async getProfile(uid) {
    return await FB.getDoc('users', uid);
  },

  async updateProfile(uid, data) {
    await FB.updateDoc('users', uid, data);
  },

  async updatePrivacy(uid, privacy) {
    await FB.updateDoc('users', uid, { privacy });
  },

  // ── PATIENT DATA ──────────────────────────────────────────
  async getPatient(uid) {
    return await FB.getDoc('patients', uid);
  },

  async updatePatient(uid, data) {
    await FB.setDoc('patients', uid, data);
  },

  async addMedication(uid, med) {
    const patient = await this.getPatient(uid);
    const meds = patient?.currentMedications || [];
    meds.push(med);
    await FB.updateDoc('patients', uid, { currentMedications: meds });
  },

  async addTreatmentHistory(uid, entry) {
    const patient = await this.getPatient(uid);
    const history = patient?.treatmentHistory || [];
    history.push({ ...entry, addedAt: new Date().toISOString() });
    await FB.updateDoc('patients', uid, { treatmentHistory: history });
  },

  // ── DOCTOR DATA ───────────────────────────────────────────
  async getDoctor(uid) {
    return await FB.getDoc('doctors', uid);
  },

  async getDoctorPatients(doctorUid) {
    return await FB.queryDocs('patients', 'doctorId', '==', doctorUid);
  },

  // Real-time listener for doctor's patient list
  listenDoctorPatients(doctorUid, callback) {
    return FB.listenQuery('patients', 'doctorId', '==', doctorUid, callback);
  },

  // ── PRESCRIPTIONS ─────────────────────────────────────────
  async addPrescription(doctorUid, patientUid, rx) {
    const id = await FB.addDoc('prescriptions', {
      doctorUid,
      patientUid,
      medicine: rx.medicine,
      dosage: rx.dosage,
      routine: rx.routine,
      notes: rx.notes || '',
      active: true,
      date: new Date().toISOString()
    });
    // Also add to patient's currentMedications
    await this.addMedication(patientUid, `${rx.medicine} — ${rx.dosage}`);
    return id;
  },

  async getPatientPrescriptions(patientUid) {
    return await FB.queryDocs('prescriptions', 'patientUid', '==', patientUid);
  },

  // Real-time listener — patient sees prescriptions update instantly when doctor writes
  listenPatientPrescriptions(patientUid, callback) {
    return FB.listenQuery('prescriptions', 'patientUid', '==', patientUid, callback);
  },

  // ── REMINDERS ─────────────────────────────────────────────
  async addReminder(uid, reminder) {
    return await FB.addDoc('reminders', { ...reminder, uid, createdAt: FB.serverTime() });
  },

  async getUserReminders(uid) {
    return await FB.queryDocs('reminders', 'uid', '==', uid);
  },

  async updateReminderStatus(docId, status, takenAt) {
    await FB.updateDoc('reminders', docId, { status, takenAt: takenAt || null });
  },

  async deleteReminder(docId) {
    await FB.deleteDoc('reminders', docId);
  },

  // Real-time reminders listener
  listenReminders(uid, callback) {
    return FB.listenQuery('reminders', 'uid', '==', uid, callback);
  },

  // ── DINACHARYA ────────────────────────────────────────────
  async saveDinacharyaTask(uid, date, taskIndex, done) {
    const docId = `${uid}_${date}`;
    const doc = await FB.getDoc('dinacharya', docId);
    const tasks = doc?.tasks || {};
    tasks[taskIndex] = done;
    await FB.setDoc('dinacharya', docId, { uid, date, tasks });
  },

  async getDinacharyaTasks(uid, date) {
    const docId = `${uid}_${date}`;
    return await FB.getDoc('dinacharya', docId);
  },

  // ── VEGA BOUTS ────────────────────────────────────────────
  async logVegaBout(doctorUid, patientUid, bout) {
    return await FB.addDoc('vegaBouts', {
      doctorUid,
      patientUid,
      ...bout,
      loggedAt: FB.serverTime()
    });
  },

  async getVegaBouts(patientUid) {
    return await FB.queryDocs('vegaBouts', 'patientUid', '==', patientUid);
  },

  // ── CHAT HISTORY ──────────────────────────────────────────
  async saveMessage(uid, role, text) {
    await FB.addDoc('chatHistory', {
      uid,
      role,   // 'user' | 'bot'
      text,
      ts: FB.serverTime()
    });
  },

  async getChatHistory(uid) {
    const snap = await firebase.firestore()
      .collection('chatHistory')
      .where('uid', '==', uid)
      .orderBy('ts', 'asc')
      .limit(100)
      .get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  // ── MEDICINES ─────────────────────────────────────────────
  async seedMedicines() {
    // Seeds Firestore with medicines from local DB if not already seeded
    const existing = await firebase.firestore().collection('medicines').limit(1).get();
    if (!existing.empty) return; // Already seeded
    const batch = firebase.firestore().batch();
    AyurDB.medicines.forEach(med => {
      const ref = firebase.firestore().collection('medicines').doc(med.id);
      batch.set(ref, med);
    });
    await batch.commit();
    console.log('✅ Medicines seeded to Firestore');
  },

  async getMedicines() {
    const snap = await firebase.firestore().collection('medicines').get();
    if (!snap.empty) return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return AyurDB.medicines; // fallback to local
  },

  // ── STORAGE: PRESCRIPTION IMAGE ───────────────────────────
  async uploadPrescriptionImage(uid, file, onProgress) {
    const path = `prescriptions/${uid}/${Date.now()}_${file.name}`;
    const url = await FB.uploadFile(path, file, onProgress);
    // Save reference to Firestore
    await FB.addDoc('prescriptions', {
      patientUid: uid,
      type: 'scanned_image',
      imageUrl: url,
      date: new Date().toISOString()
    });
    return url;
  },

  // ── DOSHA BALANCE ─────────────────────────────────────────
  async updateDoshaBalance(uid, doshaData) {
    await FB.updateDoc('patients', uid, { currentDosha: doshaData });
  },

  async getDoshaBalance(uid) {
    const patient = await this.getPatient(uid);
    return patient?.currentDosha || { vata: 33, pitta: 33, kapha: 34 };
  }
};
