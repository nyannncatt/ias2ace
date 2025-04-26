const express = require('express');
const os = require('os');
const osUtils = require('os-utils');

const app = express();
const port = 3001; // Port for backend API

app.get('/system-info', (req, res) => {
  // Fetch system info
  const systemInfo = {
    system: {
      platform: os.platform(),
      arch: os.arch(),
      cpu: os.cpus()[0].model,
      totalMem: osUtils.totalmem(),
      freeMem: osUtils.freemem(),
    },
    apps: ['Chrome', 'Visual Studio Code', 'Slack'], // You can expand this to real running apps if needed
  };

  res.json(systemInfo);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

const cors = require('cors');
app.use(cors()); // Enable CORS for all routes

