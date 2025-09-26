const express = require('express');
const app = express();

const path = require('path');
const landingRoute = require('./routes/landing.js');
const editor = require('./routes/editor.js');


const PORT = 6500;




// Static files (if needed)
// app.use(express.static(path.join(__dirname, 'public')));

// Use landing page router
app.use('/', landingRoute);
app.use('/editor', editor);


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});