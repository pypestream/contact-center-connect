// eslint-disable-next-line
const express = require('express');
// eslint-disable-next-line
const axios = require('axios');
const app = express();
const APP_PORT = 3000;

const url = `http://localhost:${APP_PORT}`;

const healthCheck = async (req, res) => {
  try {
    await axios.get(url);
    res.status(200).send();
  } catch (error) {
    res.status(500).send();
  }
};

app.get('/startup', healthCheck);

app.get('/alive', healthCheck);

app.get('/ready', healthCheck);

app.get('/metrics', healthCheck);

const HEALTH_CHECK_PORT = process.env.HEALTH_CHECK_PORT || 8082;
app.listen(HEALTH_CHECK_PORT, () =>
  // eslint-disable-next-line
  console.log(`Health Check is on Port ${HEALTH_CHECK_PORT} Ctrl + C to Stop `),
);
