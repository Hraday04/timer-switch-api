const express = require('express');
const bodyParser = require('body-parser');
const switchRoutes = require('./routes/switches');
const switchController = require('./controllers/switchController');



require('dotenv').config();
// const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public')); // ✅ serves index.htmldb;

// app.use(cors());
// app.use(express.json());
app.use('/api/switches', switchRoutes);

// Start toggling timers when server boots

switchController.initializeTimers();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
