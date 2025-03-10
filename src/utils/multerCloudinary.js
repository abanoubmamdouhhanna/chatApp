import multer from "multer";
import { asyncHandler } from "./errorHandling.js";
import { dangerousExtensions } from "./dangerousExtensions.js";
import path from "path";
import fs from "fs";
import {
  audioTypes,
  compressedTypes,
  documentTypes,
  imageTypes,
  videoTypes,
} from "./filetypes.js";

const uploadDir = "files";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
export const allowedTypesMap = {
  profilePic: imageTypes,
  messageFile: [
    ...documentTypes,
    ...imageTypes,
    ...videoTypes,
    ...audioTypes,
    ...compressedTypes,
  ],
};

const fileValidation = (allowedTypesMap = {}) => {
  return asyncHandler(async (req, file, cb) => {
    const fileExtension = file.originalname.split(".").pop().toLowerCase();
    if (dangerousExtensions.includes(fileExtension)) {
      return cb(
        new Error(`File type '${fileExtension}' not allowed`, { cause: 400 }),
        false
      );
    }
    if (!allowedTypesMap.announcementAttach) {
      const allowedMimeTypes = allowedTypesMap[file.fieldname] || [];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(
          new Error(`Invalid type for ${file.fieldname}`, { cause: 400 }),
          false
        );
      }
    }

    cb(null, true);
  });
};

export function fileUpload(size, allowedTypesMap) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  });
  const limits = { fileSize: size * 1024 * 1024 };
  const fileFilter = fileValidation(allowedTypesMap);
  const upload = multer({ fileFilter, storage, limits });
  return upload;
}
