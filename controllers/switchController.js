const db = require('../db');

const intervals = new Map(); // To track active intervals by switch ID

function startToggleInterval(id, timer) {
  if (intervals.has(id)) {
    clearInterval(intervals.get(id)); // Clear previous interval
  }

  const interval = setInterval(async () => {
    try {
      const [rows] = await db.query("SELECT state FROM switches WHERE id = ?", [id]);
      if (rows.length > 0) {
        const currentState = rows[0].state;
        const newState = !currentState;
        await db.query("UPDATE switches SET state = ? WHERE id = ?", [newState, id]);
        console.log(`⏱  ${id} toggled to ${newState ? 'ON' : 'OFF'}`);
      }
    } catch (err) {
      console.error(`Toggle interval error for switch ${id}:`, err);
    }
  }, timer * 1000);

  intervals.set(id, interval);
}


async function initializeTimers() {
  try {
    const [switches] = await db.query("SELECT id, timer FROM switches WHERE timer > 0");
    switches.forEach(({ id, timer }) => {
      startToggleInterval(id, timer);
    });
  } catch (err) {
    console.error("Error initializing timers:", err);
  }
}

exports.getAllSwitches = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM switches");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSwitchById = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM switches WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Switch not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createSwitch = async (req, res) => {
  const { name, state = false, timer = 0 } = req.body;
  try {
    const [result] = await db.query("INSERT INTO switches (name, state, timer) VALUES (?, ?, ?)", [name, state, timer]);
    if (timer > 0) startToggleInterval(result.insertId, timer);
    res.status(201).json({ id: result.insertId, name, state, timer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateSwitch = async (req, res) => {
  const { name, state, timer } = req.body;
  const id = req.params.id;
  try {
    const [result] = await db.query("UPDATE switches SET name = ?, state = ?, timer = ? WHERE id = ?", [name, state, timer, id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Switch not found" });

    // Restart the interval with new timer value if timer > 0
    if (timer > 0) {
      startToggleInterval(id, timer);
    } else {
      // Clear existing interval if timer is set to 0
      if (intervals.has(id)) {
        clearInterval(intervals.get(id));
        intervals.delete(id);
      }
    }

    res.json({ id, name, state, timer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteSwitch = async (req, res) => {
  const id = req.params.id;
  try {
    const [result] = await db.query("DELETE FROM switches WHERE id = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Switch not found" });

    // Clear interval if any
    if (intervals.has(id)) {
      clearInterval(intervals.get(id));
      intervals.delete(id);
    }

    res.json({ message: "Switch deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Export the timer initializer to call it from server.js
exports.initializeTimers = initializeTimers;

// Confirm Toggle

exports.confirmToggle = async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await db.query("SELECT state FROM switches WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ message: "Switch not found" });

    const currentState = rows[0].state;
    const newState = !currentState;
    await db.query("UPDATE switches SET state = ? WHERE id = ?", [newState, id]);
    res.json({ id, state: newState, message: `Switch ${id} toggled to ${newState ? 'ON' : 'OFF'}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
