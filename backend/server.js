import http from 'http';
import dotenv from 'dotenv';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import app from './src/app.js';
import { initSocket } from './src/services/socketService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const uploadPath = process.env.UPLOAD_PATH || './uploads';
for (const dir of ['profiles', 'screenshots']) {
  const full = join(__dirname, uploadPath, dir);
  if (!fs.existsSync(full)) fs.mkdirSync(full, { recursive: true });
}

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default server;
