import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const getSupabaseClient = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;
  if (url && key) {
    try {
      return createClient(url, key);
    } catch (e) {
      console.error('[UploadService] Supabase init error:', e);
    }
  }
  return null;
};

export const uploadService = {
  /**
   * Uploads Buffer or base64 data to target subfolder inside uploads directory or Supabase Storage
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
    const folderPrefix = cleanFolder ? `${cleanFolder}/` : '';

    let buffer = null;
    let ext = 'jpg';

    // Case A: Input is a Buffer (from Postman form-data or binary upload)
    if (Buffer.isBuffer(inputData)) {
      buffer = inputData;
      if (originalName && originalName.includes('.')) {
        ext = originalName.split('.').pop().toLowerCase();
      }
      if (ext === 'jpeg') ext = 'jpg';
      if (ext.includes('+') || ext.includes('svg')) ext = 'png';
    } else if (typeof inputData === 'string') {
      // Case B: Input is string (base64 string or relative/full URL)
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

      ext = base64Match[1] === 'jpeg' ? 'jpg' : base64Match[1];
      if (ext.includes('+') || ext.includes('svg')) ext = 'png';
      const base64Data = base64Match[2];
      buffer = Buffer.from(base64Data, 'base64');
    } else {
      throw new Error('Unsupported image format');
    }

    const fileName = `image-${Date.now()}-${Math.floor(Math.random() * 100000)}.${ext}`;

    // Try uploading to Supabase Storage if configured
    const supabase = getSupabaseClient();
    if (supabase && buffer) {
      try {
        const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'uploads';
        const storagePath = `${folderPrefix}${fileName}`;
        const contentType = ext === 'png' ? 'image/png' : ext === 'svg' ? 'image/svg+xml' : 'image/jpeg';
        
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(storagePath, buffer, { contentType, upsert: true });

        if (!error && data) {
          const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(storagePath);
          if (publicUrlData?.publicUrl) {
            return publicUrlData.publicUrl;
          }
        }
      } catch (cloudErr) {
        console.warn('[UploadService] Supabase upload failed, falling back to local disk:', cloudErr.message);
      }
    }

    // Fallback: Save to local disk
    const targetDir = cleanFolder
      ? path.join(process.cwd(), 'uploads', cleanFolder)
      : path.join(process.cwd(), 'uploads');

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const filePath = path.join(targetDir, fileName);
    await fs.promises.writeFile(filePath, buffer);

    return `${baseUrl}/uploads/${folderPrefix}${fileName}`;
  },
};
