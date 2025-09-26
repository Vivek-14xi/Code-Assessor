// server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const JUDGE0_BASE = process.env.JUDGE0_BASE || 'https://ce.judge0.com';
/*
Optional: If using RapidAPI or judge0 hosted with API key, configure headers like:
JUDGE0_EXTRA_HEADERS='{"X-RapidAPI-Key":"xxx","X-RapidAPI-Host":"judge0-ce.p.rapidapi.com"}'
*/
let extraHeaders = {};
if (process.env.JUDGE0_EXTRA_HEADERS) {
  try { extraHeaders = JSON.parse(process.env.JUDGE0_EXTRA_HEADERS); } catch(e){}
}

function judge0RequestHeaders() {
  return Object.assign({ 'Content-Type': 'application/json' }, extraHeaders);
}

// Create submission (async) and return token
app.post('/api/submit', async (req, res) => {
  try {
    const { source_code = '', language_id, stdin = '' } = req.body;
    if (!source_code || !language_id) return res.status(400).json({ error: 'source_code & language_id required' });

    const payload = {
      source_code: Buffer.from(source_code).toString('base64'),
      language_id: language_id,
      stdin: Buffer.from(stdin).toString('base64')
    };

    const url = `${JUDGE0_BASE}/submissions/?base64_encoded=true&wait=false`;
    const createResp = await axios.post(url, payload, { headers: judge0RequestHeaders() });
    const token = createResp.data.token;
    res.json({ token });
  } catch (err) {
    console.error(err?.response?.data || err.message);
    res.status(500).json({ error: 'create submission failed', details: err?.response?.data || err.message });
  }
});

// Poll result by token (server side)
app.get('/api/result/:token', async (req, res) => {
  const token = req.params.token;
  try {
    const url = `${JUDGE0_BASE}/submissions/${token}?base64_encoded=true`;
    const r = await axios.get(url, { headers: judge0RequestHeaders() });
    const data = r.data;

    // helper to decode base64 safely
    const decode = (b64) => b64 ? Buffer.from(b64, 'base64').toString('utf8') : '';

    const out = {
      status: data.status,
      status_id: data.status_id,
      stdout: decode(data.stdout),
      stderr: decode(data.stderr),
      compile_output: decode(data.compile_output),
      message: decode(data.message),
      time: data.time,
      memory: data.memory
    };
    res.json(out);
  } catch (err) {
    console.error(err?.response?.data || err.message);
    res.status(500).json({ error: 'fetch result failed', details: err?.response?.data || err.message });
  }
});

// convenience: create+poll until done (not recommended at scale)
app.post('/api/run', async (req, res) => {
  // This endpoint blocks until result (small timeout). Use only for dev/test.
  try {
    const { source_code = '', language_id, stdin = '', timeout_ms = 15000 } = req.body;
    const createUrl = `${JUDGE0_BASE}/submissions/?base64_encoded=true&wait=false`;
    const payload = {
      source_code: Buffer.from(source_code).toString('base64'),
      language_id,
      stdin: Buffer.from(stdin).toString('base64')
    };
    const createResp = await axios.post(createUrl, payload, { headers: judge0RequestHeaders() });
    const token = createResp.data.token;

    const start = Date.now();
    while (true) {
      const r = await axios.get(`${JUDGE0_BASE}/submissions/${token}?base64_encoded=true`, { headers: judge0RequestHeaders() });
      const status_id = r.data.status_id;
      if (status_id >= 3) {
        const decode = (b64) => b64 ? Buffer.from(b64, 'base64').toString('utf8') : '';
        return res.json({
          status: r.data.status,
          stdout: decode(r.data.stdout),
          stderr: decode(r.data.stderr),
          compile_output: decode(r.data.compile_output),
          time: r.data.time,
          memory: r.data.memory
        });
      }
      if (Date.now() - start > timeout_ms) return res.status(504).json({ error: 'timeout waiting for result' });
      await new Promise(s => setTimeout(s, 700)); // poll every 700ms
    }
  } catch (err) {
    console.error(err?.response?.data || err.message);
    res.status(500).json({ error: 'run failed', details: err?.response?.data || err.message });
  }
});

app.get('/api/languages', async (req, res) => {
  try {
    const r = await axios.get(`${JUDGE0_BASE}/languages`, { headers: judge0RequestHeaders() });
    res.json(r.data);
  } catch (err) {
    res.status(500).json({ error: 'cannot fetch languages', details: err?.response?.data || err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Code Assessor Backend running at http://localhost:${port}`));
