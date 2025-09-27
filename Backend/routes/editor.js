import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleChat } from "../chatcontroller/chatcontroller.js"

const router = express.Router();

// __dirname workaround for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../Frontend/views/html/editor.html'));
});
router.post("/ask", handleChat);

export default router;