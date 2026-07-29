import fs from 'fs';
import path from 'path';

export const uploadService = {
  /**
   * Uploads Buffer or base64 data to target subfolder inside uploads directory
   * @param {Buffer|string} inputData - Buffer from req.file or base64 string
   * @param {string} [reqHost] - request host header fallback
   * @param {string} [originalName] - original filename if uploaded via multipart
   * @param {string} [folder] - subfolder name e.g. 'employee', 'customer'
   * @returns {Promise<string>} - full HTTP URL of saved file
   */
  uploadImage: async (inputData, reqHost, originalName, folder = '') => {
    if (!inputData) {
      throw new Error('Invalid image data');
    }

    const baseUrl = process.env.BACKEND_URL || (reqHost ? `http://${reqHost}` : 'http://localhost:5000');

    // Clean folder name to prevent path traversal (e.g. 'employee', 'customer')
    const cleanFolder = folder ? String(folder).trim().toLowerCase().replace(/[^a-z0-9_-]/g, '') : '';
    
    const targetDir = cleanFolder
      ? path.join(process.cwd(), 'uploads', cleanFolder)
      : path.join(process.cwd(), 'uploads');

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const folderPrefix = cleanFolder ? `${cleanFolder}/` : '';

    // Case A: Input is a Buffer (from Postman form-data or binary upload)
    if (Buffer.isBuffer(inputData)) {
      let ext = 'jpg';
      if (originalName && originalName.includes('.')) {
        ext = originalName.split('.').pop().toLowerCase();
      }
      if (ext === 'jpeg') ext = 'jpg';
      if (ext.includes('+') || ext.includes('svg')) ext = 'png';

      const fileName = `image-${Date.now()}-${Math.floor(Math.random() * 100000)}.${ext}`;
      const filePath = path.join(targetDir, fileName);

      await fs.promises.writeFile(filePath, inputData);
      return `${baseUrl}/uploads/${folderPrefix}${fileName}`;
    }

    // Case B: Input is string (base64 string or relative/full URL)
    if (typeof inputData === 'string') {
      if (inputData.startsWith('http://') || inputData.startsWith('https://')) {
        return inputData;
      }

      const base64Match = inputData.match(/^data:image\/([a-zA-Z0-9+.=-]+);base64,(.+)$/);
      if (!base64Match) {
        if (inputData.startsWith('/uploads/')) {
          return `${baseUrl}${inputData}`;
        }
        return `${baseUrl}/uploads/${folderPrefix}${inputData}`;
      }

      let ext = base64Match[1] === 'jpeg' ? 'jpg' : base64Match[1];
      if (ext.includes('+') || ext.includes('svg')) ext = 'png';

      const base64Data = base64Match[2];
      const buffer = Buffer.from(base64Data, 'base64');

      const fileName = `image-${Date.now()}-${Math.floor(Math.random() * 100000)}.${ext}`;
      const filePath = path.join(targetDir, fileName);

      await fs.promises.writeFile(filePath, buffer);
      return `${baseUrl}/uploads/${folderPrefix}${fileName}`;
    }

    throw new Error('Unsupported image format');
  },
};
