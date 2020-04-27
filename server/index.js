const express = require('express');
const dotenv = require('dotenv');
const axios = require('axios');
const qs = require('qs');
const https = require('https');

const app = express();
const port = 3001;

dotenv.config();
const {
  REACT_APP_GITHUB_CLIENT_ID,
  REACT_APP_GITHUB_CLIENT_SECRET,
  OAUTH_HOST,
  OAUTH_PORT,
  OAUTH_PATH,
  OAUTH_METHOD,
} = process.env;

const corsMiddleware = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
};

function authenticate(code) {
  const payload = qs.stringify({
    code,
    client_id: REACT_APP_GITHUB_CLIENT_ID,
    client_secret: REACT_APP_GITHUB_CLIENT_SECRET,
  });
  const reqOptions = {
    host: OAUTH_HOST,
    port: OAUTH_PORT,
    path: OAUTH_PATH,
    method: OAUTH_METHOD,
    headers: { 'content-length': payload.length },
  };

  return new Promise((resolve, reject) => {
    let body = '';
    const req = https.request(reqOptions, (res) => {
      res.setEncoding('utf8');
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => resolve(qs.parse(body)));
    });
    req.write(payload);
    req.end();
    req.on('error', (e) => reject(e.message));
  });
}

app.use(corsMiddleware);
app.get('/authenticate/:code', async (req, res) => {
  try {
    const response = await authenticate(req.code);
    res.status(200).json({
      code: req.params.code,
      received: true,
      response,
    });
  } catch (apiError) {
    res.status(500).send(apiError);
  }
});

app.listen(port, () => {
  console.log(`Proxy server running on http://localhost:${port}`);
});
