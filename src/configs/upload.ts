import path from "path"
import fs from "fs"

// Absolute paths for upload directories resolved to the project (api) root,
// ensuring files live outside the source tree and work in dev and after build.
const uploadsRoot = path.resolve(__dirname, "..", "..", "uploads")
const avatarsDir = path.resolve(uploadsRoot, "avatars")
const protectedDir = path.resolve(uploadsRoot, "protected")

// Ensure directories exist (idempotent)
for (const dir of [uploadsRoot, avatarsDir, protectedDir]) {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true })
	}
}

export { uploadsRoot, avatarsDir, protectedDir }

