import express from 'express';
import path from 'path';
import landingRoute from './routes/landing.js';
import editor from './routes/editor.js';

const app = express();
const PORT = 6500;

// Middleware to parse JSON bodies
app.use(express.json());

// Static files (if needed)
// app.use(express.static(path.join(__dirname, 'public')));

// Use landing page router
app.use('/', landingRoute);
app.use('/editor', editor);

// Chatbot route


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});