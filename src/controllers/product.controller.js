const {
    createProduct: createProductService,
    getProducts: getProductsService,
    getProductsFrontend: getProductsFrontendService,
    getProductBySlug:
    getProductBySlugService,
    getProductById:
    getProductByIdService,
    updateProduct:
    updateProductService,
    deleteProduct:
    deleteProductService,
    // deleteProductImage,
    // deleteProductImages,
    toggleActiveStatus,
    deactivateProduct,
} = require("../services/product.service");

const {
    deleteProductImage,
    deleteProductImages,
} = require("../utils/file");

/*
 * POST /api/products
 */
const createProduct = async (
    req,
    res,
    next
) => {
    try {

        /*
         * Copy normal form fields only.
         */
        const productData = {
            ...req.body,
        };

        /*
         * IMPORTANT:
         *
         * img and images are uploaded files.
         * Never allow their values from req.body
         * to reach MongoDB.
         */
        delete productData.img;
        delete productData.images;

        /*
         * --------------------------------------------------
         * MAIN IMAGE
         * --------------------------------------------------
         */
        if (
            req.files?.img &&
            Array.isArray(req.files.img) &&
            req.files.img.length > 0
        ) {
            const file =
                req.files.img[0];

            productData.img =
                `/uploads/products/${file.filename}`;
        }

        /*
         * --------------------------------------------------
         * ADDITIONAL IMAGES
         * --------------------------------------------------
         */
        if (
            req.files?.images &&
            Array.isArray(req.files.images) &&
            req.files.images.length > 0
        ) {
            productData.images =
                req.files.images.map(
                    (file) =>
                        `/uploads/products/${file.filename}`
                );
        }

        /*
         * --------------------------------------------------
         * CREATE PRODUCT
         * --------------------------------------------------
         */
        const product =
            await createProductService(
                productData
            );

        return res.status(201).json({
            success: true,
            message:
                "Product created successfully.",
            data: {
                product,
            },
        });

    } catch (error) {
        next(error);
    }
};

/*
 * GET /api/products-frontend
 */
const getProductsFrontend = async (
    req,
    res,
    next
) => {
    try {
        const result =
            await getProductsFrontendService(
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
 * GET /api/products
 */
const getProducts = async (
    req,
    res,
    next
) => {
    try {
        const result =
            await getProductsService(
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
 * GET /api/products/:slug
 */
const getProductBySlug = async (
    req,
    res,
    next
) => {
    try {
        const product =
            await getProductBySlugService(
                req.params.slug
            );

        return res.status(200).json({
            success: true,
            data: {
                product,
            },
        });
    } catch (error) {
        next(error);
    }
};

/*
 * GET /api/products/:id
 */
const getProductById = async (
    req,
    res,
    next
) => {
    try {
        const product =
            await getProductByIdService(
                req.params.id
            );

        return res.status(200).json({
            success: true,
            data: {
                product,
            },
        });
    } catch (error) {
        next(error);
    }
};


/*
 * PATCH /api/products/:id
 */
/*
 * PATCH /api/products/:id
 */
const updateProduct = async (
    req,
    res,
    next
) => {
    const newUploadedFiles = [];

    try {
        /*
         * --------------------------------------------------
         * GET EXISTING PRODUCT
         * --------------------------------------------------
         */
        const existingProductResult =
            await getProductByIdService(
                req.params.id
            );

        const existingProduct =
            existingProductResult?.product ||
            existingProductResult;

        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: "Product not found.",
            });
        }

        /*
         * --------------------------------------------------
         * NORMAL BODY DATA
         * --------------------------------------------------
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
         * --------------------------------------------------
         * REMOVE IMAGES
         * --------------------------------------------------
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
         * --------------------------------------------------
         * EXISTING IMAGES
         * --------------------------------------------------
         */
        const oldImages =
            Array.isArray(
                existingProduct.images
            )
                ? existingProduct.images
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
         * --------------------------------------------------
         * NEW MAIN IMAGE
         * --------------------------------------------------
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
                `/uploads/products/${uploadedFile.filename}`;

            updateData.img =
                newMainImage;

            newUploadedFiles.push(
                newMainImage
            );
        }

        /*
         * --------------------------------------------------
         * NEW ADDITIONAL IMAGES
         * --------------------------------------------------
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
                        `/uploads/products/${file.filename}`
                );

            newUploadedFiles.push(
                ...newImages
            );
        }

        /*
         * --------------------------------------------------
         * FINAL ADDITIONAL IMAGE LIST
         * --------------------------------------------------
         *
         * Remaining old images
         * +
         * newly uploaded images
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
         * --------------------------------------------------
         * UPDATE DATABASE
         * --------------------------------------------------
         */
        const product =
            await updateProductService(
                req.params.id,
                updateData
            );

        /*
         * --------------------------------------------------
         * DELETE OLD MAIN IMAGE
         * --------------------------------------------------
         */
        if (
            req.files?.img?.length >
                0 &&
            existingProduct.img &&
            existingProduct.img !==
                updateData.img
        ) {
            await deleteProductImage(
                existingProduct.img
            );
        }

        /*
         * --------------------------------------------------
         * DELETE REMOVED ADDITIONAL IMAGES
         * --------------------------------------------------
         */
        if (
            removeImages.length > 0
        ) {
            await deleteProductImages(
                removeImages
            );
        }

        /*
         * --------------------------------------------------
         * SUCCESS
         * --------------------------------------------------
         */
        return res.status(200).json({
            success: true,
            message:
                "Product updated successfully.",
            data: {
                product,
            },
        });

    } catch (error) {
        /*
         * --------------------------------------------------
         * CLEANUP NEW FILES IF UPDATE FAILED
         * --------------------------------------------------
         */
        if (
            newUploadedFiles.length >
            0
        ) {
            try {
                await deleteProductImages(
                    newUploadedFiles
                );
            } catch (
                cleanupError
            ) {
                console.error(
                    "Failed to cleanup uploaded files:",
                    cleanupError
                );
            }
        }

        next(error);
    }
};

/*
 * DELETE /api/products/:id
 */
const deleteProduct = async (
    req,
    res,
    next
) => {
    try {
        await deleteProductService(
            req.params.id
        );

        return res.status(200).json({
            success: true,
            message:
                "Product deleted successfully.",
        });
    } catch (error) {
        next(error);
    }
};

const toggleProductActiveStatus = async (
    req,
    res,
    next
) => {
    try {
        const product = await toggleActiveStatus(req.params.id);
        return res.status(200).json({
            success: true,
            message: "Product active status toggled successfully.",
            data: { product },
        });
    } catch (error) {
        next(error);
    }
};

const deactivateProductController = async (
    req,
    res,
    next
) => {
    try {
        const product = await deactivateProduct(req.params.id);
        return res.status(200).json({
            success: true,
            message: "Product deactivated successfully.",
            data: { product },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createProduct,
    getProducts,
    getProductsFrontend,
    getProductBySlug,
    updateProduct,
    deleteProduct,
    getProductById,
    toggleProductActiveStatus,
    deactivateProduct,
    deactivateProductController,
};
