// Modules ko import karna
const express = require('express');
const { exec } = require('child_process'); // <--- Yahi module Docker command chalayega
const fs = require('fs'); // Temporary files banane aur delete karne ke liye
const path = require('path'); // Paths ko sahi se jodne ke liye
const app = express();
const port = 3000;

// Middleware for parsing JSON requests (Bahut zaroori)
app.use(express.json());

// --- Setup aur Configurations ---

// 1. DockerName folder ka path define karna (Bahut Zaroori!)
// Yahaan aapko 'Backend' folder se 'DockerName' folder tak ka path dena hai.
const dockerFolderPath = path.join(__dirname, '..', 'DockerName'); 

// 2. Temp folder ka path
const tempDir = path.join(__dirname, 'temp');

// Run hone waali Docker Image ka naam
const containerImage = 'multi-compiler-image'; 

// Ensure temp directory exists
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
}


// --- Core Function: Code Execution ---

function runCodeInDocker(code, language, res) {
    
    // 1. File Naming aur Path Setup
    const fileExtension = language === 'python' ? 'py' : 'cpp';
    // Ek unique file name banao taaki submissions clash na karein
    const fileName = `user_code_${Date.now()}.${fileExtension}`; 
    const filePath = path.join(tempDir, fileName);
    
    // Hardcoded Input (Frontend se aayega, abhi test ke liye set kiya)
    const userInput = "10\n20"; 

    // File mein code ko save kiya jaa raha hai
    fs.writeFileSync(filePath, code);


    // 2. Dynamic Docker Command Banana
    let executionCommand = ""; 
    
    if (language === 'python') {
        // Python ke liye: Input pipe karke interpreter chalao
        executionCommand = `echo -e '${userInput}' | python3 /app/${fileName}`;
    } 
    else if (language === 'c++') {
        // C++ ke liye: Compile (g++) karo, aur agar successful ho (&&), toh run karo
        const executableName = 'a.out';
        executionCommand = `g++ /app/${fileName} -o /app/${executableName} && echo -e '${userInput}' | /app/${executableName}`;
    } 
    
    // --- FINAL DOCKER COMMAND STRING ---
    // Ab 'filePath' ko container ke andar mount karte hain.
    // NOTE: Yahaan 'executionCommand' ko /bin/bash -c ke andar wrap karna zaroori hai.
    const dockerCommand = `docker run --rm -v "${filePath}:/app/${fileName}" ${containerImage} /bin/bash -c "${executionCommand}"`;

    
    // 3. Command Execute karna (Asynchronous)
    console.log(`Executing Docker: ${dockerCommand}`);
    
    exec(dockerCommand, (error, stdout, stderr) => {
        
        // --- 4. File Cleanup (MUST) ---
        // Kaam khatam hone ke baad temporary file ko delete karna zaroori hai
        try {
            fs.unlinkSync(filePath); 
        } catch (cleanupError) {
            console.error(`Cleanup failed for ${filePath}:`, cleanupError);
        }

        // --- 5. Response Handling ---
        let output = stdout.trim();
        let status = 'Success';
        
        if (error || stderr) {
            status = 'Execution Failed';
            output = stderr || error.message; 
        }

        // Frontend/Testing tool ko final result bhejna
        res.status(200).json({ status, output });
    });
}


// --- API Route Aur Server Start ---

app.post('/api/execute', (req, res) => {
    const { code, language } = req.body;

    if (!code || !language) {
        return res.status(400).json({ error: 'Code and language are required.' });
    }

    runCodeInDocker(code, language.toLowerCase(), res);
});

app.listen(port, () => {
    console.log(`Code Assessor Backend running at http://localhost:${port}`);
});