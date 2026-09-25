const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDirectory = path.join(
    process.cwd(),
    "uploads",
    "products"
);

/*
 * Create upload directory if it doesn't exist.
 */
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, {
        recursive: true,
    });
}

/*
 * Storage configuration
 */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },

    filename: (req, file, cb) => {
        const extension = path.extname(
            file.originalname
        ).toLowerCase();

        const uniqueName =
            `product-${Date.now()}-${Math.round(
                Math.random() * 1e9
            )}${extension}`;

        cb(null, uniqueName);
    },
});

/*
 * Allowed image types
 */
const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/avif",
    "image/jfif",
    "image/gif",
];

/*
 * File filter
 */
const fileFilter = (
    req,
    file,
    cb
) => {
    if (
        allowedMimeTypes.includes(
            file.mimetype
        )
    ) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Only JPEG, PNG, WEBP and GIF images are allowed."
            ),
            false
        );
    }
};

/*
 * Multer configuration
 */
const upload = multer({
    storage,

    fileFilter,

    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 10,
    },
});

module.exports = upload;