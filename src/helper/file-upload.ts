import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

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
