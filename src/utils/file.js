const fs = require("fs/promises");
const path = require("path");

const deleteUploadedFile = async (fileUrl) => {
    if (!fileUrl) {
        return;
    }

    /*
     * Only delete files that belong to our local uploads.
     *
     * This prevents accidentally trying to delete:
     * https://example.com/image.jpg
     */
    if (!fileUrl.startsWith("/uploads/")) {
        return;
    }

    const filePath = path.join(
        process.cwd(),
        fileUrl.replace(/^\/+/, "")
    );

    try {
        await fs.unlink(filePath);

        // console.log(
        //     `Deleted file: ${filePath}`
        // );
    } catch (error) {
        /*
         * File may already have been deleted.
         */
        if (error.code !== "ENOENT") {
            throw error;
        }
    }
};

const deleteProductFiles = async (product) => {
    /*
     * Delete main image.
     */
    if (product.img) {
        await deleteUploadedFile(
            product.img
        );
    }

    /*
     * Delete additional images.
     */
    if (
        Array.isArray(product.images)
    ) {
        for (const image of product.images) {
            await deleteUploadedFile(
                image
            );
        }
    }
};

const deleteProductImage = async (imagePath) => {
    if (!imagePath) {
        return;
    }

    /*
     * If the database contains:
     *
     * /uploads/products/example.jpg
     *
     * convert it to:
     *
     * <project>/uploads/products/example.jpg
     */
    const cleanPath = imagePath
        .replace(/^https?:\/\/[^/]+/i, "")
        .replace(/^\/+/, "");

    const filePath = path.join(
        process.cwd(),
        cleanPath
    );

    try {
        await fs.unlink(filePath);
    } catch (error) {
        if (error.code !== "ENOENT") {
            console.error(
                "Failed to delete product image:",
                error.message
            );
        }
    }
};

const deleteProductImages = async (
    images = []
) => {
    if (!Array.isArray(images)) {
        return;
    }

    for (const image of images) {
        await deleteProductImage(image);
    }
};

const deleteKeywordImage = async (imagePath) => {
    if (!imagePath || typeof imagePath !== "string") {
        return;
    }

    // Convert full URL to a relative upload path.
    const cleanPath = imagePath
        .replace(/^https?:\/\/[^/]+/i, "")
        .replace(/^\/+/, "");

    // Only allow deletion from the keywords upload directory.
    if (!cleanPath.startsWith("uploads/keywords/")) {
        return;
    }

    const uploadRoot = path.resolve(
        process.cwd(),
        "uploads",
        "keywords"
    );

    const filePath = path.resolve(
        process.cwd(),
        cleanPath
    );

    // Prevent path traversal outside the keywords directory.
    if (
        !filePath.startsWith(uploadRoot + path.sep)
    ) {
        return;
    }

    try {
        await fs.unlink(filePath);
    } catch (error) {
        if (error.code !== "ENOENT") {
            throw error;
        }
    }
};

const deleteKeywordImages = async (images = []) => {
    if (!Array.isArray(images)) {
        return;
    }

    for (const image of images) {
        await deleteKeywordImage(image);
    }
};

module.exports = {
    deleteUploadedFile,
    deleteProductFiles,
    deleteProductImage,
    deleteProductImages,
    deleteKeywordImage,
    deleteKeywordImages,
};