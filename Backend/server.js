import express from 'express';
import path from 'path';
import landingRoute from './routes/landing.js';
import editor from './routes/editor.js';
import teacher from "./routes/teacher-dashboard.js"
import student from "./routes/student-dahboard.js"
import feature from "./routes/feature.js"
import mocktest from "./routes/mocktest.js"
import login from "./routes/login.js"


const app = express();
const PORT = 6500;

// Middleware to parse JSON bodies
app.use(express.json());

// Static files (if needed)
// app.use(express.static(path.join(__dirname, 'public')));

// Use landing page router
app.use('/', landingRoute);
app.use('/editor', editor);
app.use('/teacher',teacher);
app.use('/student',student);
app.use('/feature',feature);
app.use('/mock',mocktest);
app.use('/login', login);


// Chatbot route


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
