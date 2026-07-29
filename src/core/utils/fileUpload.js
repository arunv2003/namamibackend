import fs from 'fs';
import path from 'path';

/**
 * Saves a base64 image or file string to the target disk uploads subfolder (e.g., 'employee', 'customer') and returns its full URL.
 * @param {string} imageData - base64 data string, relative path, or existing URL
 * @param {string} [reqHost] - optional request host fallback
 * @param {string} [folder] - subfolder name (e.g. 'employee', 'customer')
 * @returns {string|null} - Full HTTP URL of the saved image file
 */
export const saveImageToDisk = (imageData, reqHost, folder = '') => {
  if (!imageData || typeof imageData !== 'string') return imageData || null;

  // If already a full http/https URL, return as is
  if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
    return imageData;
  }

  const baseUrl = process.env.BACKEND_URL || (reqHost ? `http://${reqHost}` : 'http://localhost:5000');
  const cleanFolder = folder ? String(folder).trim().toLowerCase().replace(/[^a-z0-9_-]/g, '') : '';
  const folderPrefix = cleanFolder ? `${cleanFolder}/` : '';

  // If already a relative path like /uploads/filename.png
  if (imageData.startsWith('/uploads/') || imageData.startsWith('/upload/')) {
    return `${baseUrl}${imageData}`;
  }

  // Extract base64 image data
  const base64Match = imageData.match(/^data:image\/([a-zA-Z0-9+.=-]+);base64,(.+)$/);
  if (!base64Match) {
    // If raw string path or filename
    if (imageData.includes('/')) {
      const cleanPath = imageData.startsWith('/') ? imageData : `/${imageData}`;
      return `${baseUrl}${cleanPath}`;
    }
    return `${baseUrl}/uploads/${folderPrefix}${imageData}`;
  }

  let ext = base64Match[1] === 'jpeg' ? 'jpg' : base64Match[1];
  if (ext.includes('+') || ext.includes('svg')) ext = 'png';
  const base64Data = base64Match[2];
  const buffer = Buffer.from(base64Data, 'base64');

  const targetDir = cleanFolder
    ? path.join(process.cwd(), 'uploads', cleanFolder)
    : path.join(process.cwd(), 'uploads');

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const fileName = `image-${Date.now()}-${Math.floor(Math.random() * 100000)}.${ext}`;
  const filePath = path.join(targetDir, fileName);

  fs.writeFileSync(filePath, buffer);

  return `${baseUrl}/uploads/${folderPrefix}${fileName}`;
};
