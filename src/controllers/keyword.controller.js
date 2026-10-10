const {
    createKeyword: createKeywordService,

    getKeywords: getKeywordsService,

    getKeywordsFrontend:
        getKeywordsFrontendService,

    getKeywordBySlug:
        getKeywordBySlugService,

    getKeywordById:
        getKeywordByIdService,

    updateKeyword:
        updateKeywordService,

    deleteKeyword:
        deleteKeywordService,

    toggleActiveStatus,

    deactivateKeyword,
} = require("../services/keyword.service");

const {
    deleteKeywordImage,
    deleteKeywordImages,
} = require("../utils/file");

/*
|--------------------------------------------------------------------------
| POST /api/keywords
|--------------------------------------------------------------------------
*/

const createKeyword = async (
    req,
    res,
    next
) => {
    try {
        /*
         * Copy normal form fields only.
         */
        const keywordData = {
            ...req.body,
        };

        /*
         * IMPORTANT:
         *
         * img and images are uploaded files.
         * Never allow values from req.body
         * to reach MongoDB.
         */
        delete keywordData.img;
        delete keywordData.images;

        /*
        |--------------------------------------------------------------------------
        | MAIN IMAGE
        |--------------------------------------------------------------------------
        */

        if (
            req.files?.img &&
            Array.isArray(req.files.img) &&
            req.files.img.length > 0
        ) {
            const file =
                req.files.img[0];

            keywordData.img =
                `/uploads/keywords/${file.filename}`;
        }

        /*
        |--------------------------------------------------------------------------
        | ADDITIONAL IMAGES
        |--------------------------------------------------------------------------
        */

        if (
            req.files?.images &&
            Array.isArray(req.files.images) &&
            req.files.images.length > 0
        ) {
            keywordData.images =
                req.files.images.map(
                    (file) =>
                        `/uploads/keywords/${file.filename}`
                );
        }

        /*
        |--------------------------------------------------------------------------
        | CREATE KEYWORD
        |--------------------------------------------------------------------------
        */

        const keyword =
            await createKeywordService(
                keywordData
            );

        return res.status(201).json({
            success: true,

            message:
                "Keyword created successfully.",

            data: {
                keyword,
            },
        });
    } catch (error) {
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| GET /api/keywords-frontend
|--------------------------------------------------------------------------
*/

const getKeywordsFrontend = async (
    req,
    res,
    next
) => {
    try {
        const result =
            await getKeywordsFrontendService(
                req.query
            );

        return res.status(200).json({
            success: true,

            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| GET /api/keywords
|--------------------------------------------------------------------------
*/

const getKeywords = async (
    req,
    res,
    next
) => {
    try {
        const result =
            await getKeywordsService(
                req.query
            );

        return res.status(200).json({
            success: true,

            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| GET /api/keywords/:slug
|--------------------------------------------------------------------------
*/

const getKeywordBySlug = async (
    req,
    res,
    next
) => {
    try {
        const keyword =
            await getKeywordBySlugService(
                req.params.slug
            );

        return res.status(200).json({
            success: true,

            data:  keyword,
        });
    } catch (error) {
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| GET /api/keywords/:id
|--------------------------------------------------------------------------
*/

const getKeywordById = async (
    req,
    res,
    next
) => {
    try {
        const keyword =
            await getKeywordByIdService(
                req.params.id
            );

        return res.status(200).json({
            success: true,

            data: {
                keyword,
            },
        });
    } catch (error) {
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| PATCH /api/keywords/:id
|--------------------------------------------------------------------------
*/

const updateKeyword = async (
    req,
    res,
    next
) => {
    const newUploadedFiles = [];

    try {
        /*
        |--------------------------------------------------------------------------
        | GET EXISTING KEYWORD
        |--------------------------------------------------------------------------
        */

        const existingKeywordResult =
            await getKeywordByIdService(
                req.params.id
            );

        const existingKeyword =
            existingKeywordResult?.keyword ||
            existingKeywordResult;

        if (!existingKeyword) {
            return res.status(404).json({
                success: false,

                message:
                    "Keyword not found.",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | NORMAL BODY DATA
        |--------------------------------------------------------------------------
        */

        const updateData = {
            ...req.body,
        };

        /*
         * Files are handled by multer.
         */
        delete updateData.img;
        delete updateData.images;

        /*
        |--------------------------------------------------------------------------
        | REMOVE IMAGES
        |--------------------------------------------------------------------------
        */

        let removeImages = [];

        if (
            req.body.removeImages !==
            undefined
        ) {
            removeImages =
                req.body.removeImages;

            /*
             * Multipart/form-data sends this
             * as a string.
             */
            if (
                typeof removeImages ===
                "string"
            ) {
                try {
                    removeImages =
                        JSON.parse(
                            removeImages
                        );
                } catch {
                    removeImages = [
                        removeImages,
                    ];
                }
            }

            if (
                !Array.isArray(
                    removeImages
                )
            ) {
                return res.status(400).json({
                    success: false,

                    message:
                        "removeImages must be an array.",
                });
            }

            removeImages =
                removeImages.filter(
                    (image) =>
                        typeof image ===
                            "string" &&
                        image.trim() !== ""
                );
        }

        /*
         * Don't save removeImages in MongoDB.
         */
        delete updateData.removeImages;

        /*
        |--------------------------------------------------------------------------
        | EXISTING IMAGES
        |--------------------------------------------------------------------------
        */

        const oldImages =
            Array.isArray(
                existingKeyword.images
            )
                ? existingKeyword.images
                : [];

        /*
         * Images remaining after removal.
         */
        const remainingImages =
            oldImages.filter(
                (image) =>
                    !removeImages.includes(
                        image
                    )
            );

        /*
        |--------------------------------------------------------------------------
        | NEW MAIN IMAGE
        |--------------------------------------------------------------------------
        */

        if (
            req.files?.img &&
            Array.isArray(
                req.files.img
            ) &&
            req.files.img.length > 0
        ) {
            const uploadedFile =
                req.files.img[0];

            const newMainImage =
                `/uploads/keywords/${uploadedFile.filename}`;

            updateData.img =
                newMainImage;

            newUploadedFiles.push(
                newMainImage
            );
        }

        /*
        |--------------------------------------------------------------------------
        | NEW ADDITIONAL IMAGES
        |--------------------------------------------------------------------------
        */

        let newImages = [];

        if (
            req.files?.images &&
            Array.isArray(
                req.files.images
            ) &&
            req.files.images.length > 0
        ) {
            newImages =
                req.files.images.map(
                    (file) =>
                        `/uploads/keywords/${file.filename}`
                );

            newUploadedFiles.push(
                ...newImages
            );
        }

        /*
        |--------------------------------------------------------------------------
        | FINAL ADDITIONAL IMAGE LIST
        |--------------------------------------------------------------------------
        |
        | Remaining old images
        | +
        | newly uploaded images
        |
        */

        if (
            removeImages.length > 0 ||
            newImages.length > 0
        ) {
            updateData.images = [
                ...remainingImages,
                ...newImages,
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | UPDATE DATABASE
        |--------------------------------------------------------------------------
        */

        const keyword =
            await updateKeywordService(
                req.params.id,
                updateData
            );

        /*
        |--------------------------------------------------------------------------
        | DELETE OLD MAIN IMAGE
        |--------------------------------------------------------------------------
        */

        if (
            req.files?.img?.length >
                0 &&
            existingKeyword.img &&
            existingKeyword.img !==
                updateData.img
        ) {
            await deleteKeywordImage(
                existingKeyword.img
            );
        }

        /*
        |--------------------------------------------------------------------------
        | DELETE REMOVED ADDITIONAL IMAGES
        |--------------------------------------------------------------------------
        */

        if (
            removeImages.length > 0
        ) {
            await deleteKeywordImages(
                removeImages
            );
        }

        /*
        |--------------------------------------------------------------------------
        | SUCCESS
        |--------------------------------------------------------------------------
        */

        return res.status(200).json({
            success: true,

            message:
                "Keyword updated successfully.",

            data: {
                keyword,
            },
        });
    } catch (error) {
        /*
        |--------------------------------------------------------------------------
        | CLEANUP NEW FILES IF UPDATE FAILED
        |--------------------------------------------------------------------------
        */

        if (
            newUploadedFiles.length >
            0
        ) {
            try {
                await deleteKeywordImages(
                    newUploadedFiles
                );
            } catch (
                cleanupError
            ) {
                console.error(
                    "Failed to cleanup uploaded keyword files:",
                    cleanupError
                );
            }
        }

        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| DELETE /api/keywords/:id
|--------------------------------------------------------------------------
*/

const deleteKeyword = async (
    req,
    res,
    next
) => {
    try {
        await deleteKeywordService(
            req.params.id
        );

        return res.status(200).json({
            success: true,

            message:
                "Keyword deleted successfully.",
        });
    } catch (error) {
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| PATCH /api/keywords/:id/toggle-status
|--------------------------------------------------------------------------
*/

const toggleKeywordActiveStatus = async (
    req,
    res,
    next
) => {
    try {
        const keyword =
            await toggleActiveStatus(
                req.params.id
            );

        return res.status(200).json({
            success: true,

            message:
                "Keyword active status toggled successfully.",

            data: {
                keyword,
            },
        });
    } catch (error) {
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| PATCH /api/keywords/:id/deactivate
|--------------------------------------------------------------------------
*/

const deactivateKeywordController = async (
    req,
    res,
    next
) => {
    try {
        const keyword =
            await deactivateKeyword(
                req.params.id
            );

        return res.status(200).json({
            success: true,

            message:
                "Keyword deactivated successfully.",

            data: {
                keyword,
            },
        });
    } catch (error) {
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

module.exports = {
    createKeyword,

    getKeywords,

    getKeywordsFrontend,

    getKeywordBySlug,

    getKeywordById,

    updateKeyword,

    deleteKeyword,

    toggleKeywordActiveStatus,

    deactivateKeywordController,
};