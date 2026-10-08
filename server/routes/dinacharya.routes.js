// server/routes/dinacharya.routes.js
const router = require('express').Router();
const auth   = require('../middleware/auth');
const db     = require('../db');

// GET /api/dinacharya/:userId/:date
router.get('/:userId/:date', auth, async (req, res) => {
  try {
    const rows = await db('dinacharya_tasks')
      .where({ user_id: req.params.userId, date: req.params.date })
      .orderBy('task_index');
    return res.json({ success: true, data: rows });
  } catch (err) { return res.status(500).json({ success: false, error: err.message }); }
});

// PUT /api/dinacharya/:userId/:date/:taskIndex  — upsert task done state
router.put('/:userId/:date/:taskIndex', auth, async (req, res) => {
  try {
    const { done, task_text, task_time } = req.body;
    await db('dinacharya_tasks')
      .insert({ user_id: req.params.userId, date: req.params.date, task_index: parseInt(req.params.taskIndex), done, task_text, task_time })
      .onConflict(['user_id', 'date', 'task_index'])
      .merge({ done });
    return res.json({ success: true });
  } catch (err) { return res.status(500).json({ success: false, error: err.message }); }
});

module.exports = router;
