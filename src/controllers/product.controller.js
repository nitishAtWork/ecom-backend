const {
    createProduct: createProductService,
    getProducts: getProductsService,
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
        const productData = {
            ...req.body,
        };

        /*
         * Main image
         */
        if (
            req.files?.img &&
            req.files.img.length > 0
        ) {
            productData.img =
                `/uploads/products/${req.files.img[0].filename}`;
        }

        /*
         * Additional images
         */
        if (
            req.files?.images &&
            req.files.images.length > 0
        ) {
            productData.images =
                req.files.images.map(
                    (file) =>
                        `/uploads/products/${file.filename}`
                );
        }

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
const updateProduct = async (
    req,
    res,
    next
) => {
    try {
        /*
         * Copy normal body fields.
         *
         * img/images are file fields and must NOT come
         * from req.body.
         */
        const updateData = {
            ...req.body,
        };

        /*
         * Remove file fields if they somehow exist
         * inside req.body.
         */
        delete updateData.img;
        delete updateData.images;

        /*
         * Keep track of newly uploaded files.
         *
         * If MongoDB update fails, these files must
         * be deleted because they are not referenced
         * by the database.
         */
        const newUploadedImages = [];

        /*
         * Get existing product BEFORE updating it.
         */
        const existingProductResult =
            await getProductByIdService(
                req.params.id
            );

        /*
         * Depending on your service implementation,
         * it may return the product directly or:
         *
         * { product }
         */
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
         * Track whether new images were uploaded.
         *
         * This is important because we only delete
         * old files when they are actually replaced.
         */
        let newMainImageUploaded = false;
        let newAdditionalImagesUploaded = false;

        /*
         * --------------------------------------------------
         * NEW MAIN IMAGE
         * --------------------------------------------------
         */
        if (
            req.files?.img &&
            Array.isArray(req.files.img) &&
            req.files.img.length > 0
        ) {
            const uploadedFile =
                req.files.img[0];

            const newMainImage =
                `/uploads/products/${uploadedFile.filename}`;

            updateData.img =
                newMainImage;

            newUploadedImages.push(
                newMainImage
            );

            newMainImageUploaded = true;
        }

        /*
         * --------------------------------------------------
         * NEW ADDITIONAL IMAGES
         * --------------------------------------------------
         */
        if (
            req.files?.images &&
            Array.isArray(req.files.images) &&
            req.files.images.length > 0
        ) {
            const newImages =
                req.files.images.map(
                    (file) =>
                        `/uploads/products/${file.filename}`
                );

            updateData.images =
                newImages;

            newUploadedImages.push(
                ...newImages
            );

            newAdditionalImagesUploaded = true;
        }

        /*
         * --------------------------------------------------
         * UPDATE DATABASE
         * --------------------------------------------------
         */
        try {
            const product =
                await updateProductService(
                    req.params.id,
                    updateData
                );

            /*
             * --------------------------------------------------
             * DELETE OLD MAIN IMAGE
             * --------------------------------------------------
             *
             * Only delete it if a new main image was uploaded.
             */
            if (
                newMainImageUploaded &&
                existingProduct.img &&
                existingProduct.img !== updateData.img
            ) {
                await deleteProductImage(
                    existingProduct.img
                );
            }

            /*
             * --------------------------------------------------
             * DELETE OLD ADDITIONAL IMAGES
             * --------------------------------------------------
             *
             * Only delete old images when new images
             * were uploaded.
             */
            if (
                newAdditionalImagesUploaded &&
                Array.isArray(
                    existingProduct.images
                ) &&
                existingProduct.images.length > 0
            ) {
                await deleteProductImages(
                    existingProduct.images
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
             * DATABASE UPDATE FAILED
             * --------------------------------------------------
             *
             * The newly uploaded files are not referenced
             * by MongoDB, so remove them.
             */
            if (
                newUploadedImages.length > 0
            ) {
                await deleteProductImages(
                    newUploadedImages
                );
            }

            throw error;
        }

    } catch (error) {
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
    getProductBySlug,
    updateProduct,
    deleteProduct,
    getProductById,
    toggleProductActiveStatus,
    deactivateProduct,
    deactivateProductController,
};
