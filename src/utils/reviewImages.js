const fs = require("fs/promises");
const path = require("path");

const deleteReviewImages = async (
    images = []
) => {
    if (!Array.isArray(images)) {
        return;
    }

    for (const image of images) {
        try {
            const imagePath = String(
                image || ""
            );

            /*
             * Only delete files from review folder.
             */
            if (
                !imagePath.startsWith(
                    "/uploads/reviews/"
                )
            ) {
                continue;
            }

            const filename =
                path.basename(imagePath);

            if (!filename) {
                continue;
            }

            const absolutePath =
                path.join(
                    process.cwd(),
                    "uploads",
                    "reviews",
                    filename
                );

            await fs.unlink(
                absolutePath
            );
        } catch (error) {
            /*
             * File already deleted.
             */
            if (
                error.code !== "ENOENT"
            ) {
                console.error(
                    "Review image delete error:",
                    error
                );
            }
        }
    }
};

module.exports = {
    deleteReviewImages,
};