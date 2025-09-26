const express = require('express');
const { exec } = require('child_process');

const app = express();
const PORT = 6000;

app.get('/run-python', (req, res) => {
    exec('python test.py', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return res.status(500).send(`Error: ${error.message}`);
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
            return res.status(500).send(`Stderr: ${stderr}`);
        }
        res.send(`Output: ${stdout}`);
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
