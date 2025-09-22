import { Request } from "express"
import multer from "multer"
import path from "path"
import crypto from "crypto"
import fs from "fs"

const MAX_SIZE = 4 * 1024 * 1024 // 4MB

const uploadsFolder = path.resolve(__dirname, "..", "..", "uploads")
const avatarFolder = path.resolve(uploadsFolder, "avatars")

// Ensure uploads directory exists
if (!fs.existsSync(uploadsFolder)) {
  fs.mkdirSync(uploadsFolder)
}
if (!fs.existsSync(avatarFolder)) {
  fs.mkdirSync(avatarFolder)
}

const storageAvatar = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, avatarFolder)
  },
  filename: function (req: Request, file: Express.Multer.File, cb) {
    // Create unique filename with original extension
    const fileHash = crypto.randomBytes(10).toString("hex")
    const fileName = `${fileHash}-${file.originalname}`
    return cb(null, fileName)
  },
})

const uploadAvatar = multer({
  storage: storageAvatar,
  limits: {
    fileSize: MAX_SIZE, // 4MB
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"))
    }
    cb(null, true)
  },
})

export { uploadAvatar }
