const multer = require("multer");
const path = require("path");
const fs = require("fs");

const createUpload = (folder) => {
    const uploadDirectory = path.join(
        process.cwd(),
        "uploads",
        folder
    );

    /*
     * Create directory if it doesn't exist.
     */
    if (!fs.existsSync(uploadDirectory)) {
        fs.mkdirSync(uploadDirectory, {
            recursive: true,
        });
    }

    /*
     * Storage
     */
    const storage = multer.diskStorage({
        destination: (
            req,
            file,
            cb
        ) => {
            cb(
                null,
                uploadDirectory
            );
        },

        filename: (
            req,
            file,
            cb
        ) => {
            const extension =
                path.extname(
                    file.originalname
                ).toLowerCase();

            const uniqueName =
                `${folder}-${Date.now()}-${Math.round(
                    Math.random() * 1e9
                )}${extension}`;

            cb(
                null,
                uniqueName
            );
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
            cb(
                null,
                true
            );
        } else {
            cb(
                new Error(
                    "Only JPEG, PNG, WEBP, AVIF and GIF images are allowed."
                ),
                false
            );
        }
    };

    return multer({
        storage,

        fileFilter,

        limits: {
            fileSize:
                5 * 1024 * 1024,

            files: 10,
        },
    });
};

module.exports = {
    createUpload,
};