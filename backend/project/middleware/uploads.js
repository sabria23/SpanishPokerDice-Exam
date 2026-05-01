import multer from "multer";

/* Storage config */
// diskStorage saves files to the local filesystem
const storage = multer.diskStorage({
    // Where to save the uploaded files
    destination: (req, file, cb) => {
        cb(null, "uploads/trophies/"); // Folder has to exist
    },
    
    // What to name the saved file
    // Using Date.now() + original name to avoid filename collisions
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

/* File filter */
// Only allow image files to be uploaded
function fileFilter(req, file, cb) {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true); // accept the file
    } else {
        cb(new Error("Only JPEG/JPG, PNG and WebP images are allowed"), false); // Rejects the file
    }
}

/* Multer instance */
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB max file size
    }
});

const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/avatars/"); // Make sure this folder exists
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const uploadAvatar = multer({
    storage: avatarStorage,
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB max
    }
});

export default {
    upload,
    uploadAvatar
};