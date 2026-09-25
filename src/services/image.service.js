const fs = require("fs/promises");
const path = require("path");

const PRODUCT_UPLOAD_DIR = path.join(
    process.cwd(),
    "uploads",
    "products"
);

const deleteProductImage = async (imagePath) => {
    if (!imagePath) {
        return;
    }

    // Only allow deleting files from our product upload directory
    if (!imagePath.startsWith("/uploads/products/")) {
        return;
    }

    const filename = path.basename(imagePath);

    if (!filename) {
        return;
    }

    const filePath = path.join(
        PRODUCT_UPLOAD_DIR,
        filename
    );

    try {
        await fs.unlink(filePath);
        console.log(`Deleted old product image: ${filename}`);
    } catch (error) {
        // File already doesn't exist
        if (error.code !== "ENOENT") {
            console.error(
                `Failed to delete product image ${filename}:`,
                error.message
            );
        }
    }
};

const deleteProductImages = async (imagePaths = []) => {
    if (!Array.isArray(imagePaths)) {
        return;
    }

    await Promise.all(
        imagePaths.map((imagePath) =>
            deleteProductImage(imagePath)
        )
    );
};

module.exports = {
    deleteProductImage,
    deleteProductImages,
};