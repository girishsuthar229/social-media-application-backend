import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { v2 as cloudinary } from 'cloudinary';
import * as dotenv from 'dotenv';

dotenv.config();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function saveFileCloudinary(
  file: Express.Multer.File,
  targetFolder: string,
) {
  try {
    const publicId = `${uuidv4()}-${file.originalname}`;
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            public_id: publicId,
            resource_type: 'auto',
            folder: targetFolder,
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          },
        )
        .end(file.buffer);
    });
    console.log('Cloudinary upload result:', uploadResult);
    const baseUrl = 'https://res.cloudinary.com/di5jqgyc5/image/upload/';
    const imagePath = uploadResult.secure_url.split(baseUrl)[1]; // Extract the path after 'upload/'
    return imagePath;
  } catch (error) {
    console.error('Error in saving file to Cloudinary:', error);
    throw error;
  }
}

export function saveFileLocally(
  file: Express.Multer.File,
  targetFolder: string,
): string {
  const uploadDir = path.join(__dirname, '..', '..', 'uploads', targetFolder);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const ext = path.extname(file.originalname);
  const fileName = `${uuidv4()}${ext}`;
  const filePath = path.join(uploadDir, fileName);
  fs.writeFileSync(filePath, file.buffer);

  return `${targetFolder}/${fileName}`;
}

export function deleteLocalFile(imageUrl: string, targetFolder: string): void {
  const fileName = path.basename(imageUrl);
  const filePath = path.join(
    __dirname,
    '..',
    '..',
    'uploads',
    targetFolder,
    fileName,
  );

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}
