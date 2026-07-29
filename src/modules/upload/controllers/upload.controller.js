import { uploadService } from '../services/upload.service.js';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import { ApiResponse } from '../../../core/utils/apiResponse.js';
import { ApiError } from '../../../core/utils/api.Errors.js';

export const uploadImage = asyncHandler(async (req, res) => {
  const fileBuffer = req.file?.buffer;
  const originalName = req.file?.originalname;
  const rawImage = req.body?.image || req.body?.thumbnail || req.body?.file;
  const folder = req.body?.folder || req.query?.folder || req.params?.folder || '';

  if (!fileBuffer && !rawImage) {
    throw new ApiError(400, 'Image file or base64 data is required');
  }

  const imageUrl = await uploadService.uploadImage(
    fileBuffer || rawImage,
    req.get('host'),
    originalName,
    folder
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        url: imageUrl,
        image: imageUrl,
        thumbnail: imageUrl,
        folder: folder || 'general',
      },
      'Image uploaded successfully'
    )
  );
});
