import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// backend/src/config -> backend/src -> backend
const backendRoot = path.resolve(__dirname, '..', '..');

export function resolveUploadRoot() {
  const configured = process.env.UPLOAD_PATH;
  if (!configured) return path.join(backendRoot, 'uploads');
  if (path.isAbsolute(configured)) return configured;
  return path.resolve(backendRoot, configured);
}

