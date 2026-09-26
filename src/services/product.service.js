const Product = require("../models/Product");
const slugify = require("slugify");

const {
    deleteProductFiles,
} = require("../utils/file");

const BASE_URL = (
    process.env.BASE_URL ||
    ""
).replace(/\/$/, "");

const prepareImageUrl = (image) => {
    if (!image) {
        return image;
    }

    /*
     * Already a complete URL.
     */
    if (
        image.startsWith("http://") ||
        image.startsWith("https://")
    ) {
        return image;
    }

    return `${BASE_URL}${image}`;
};

const deleteUploadedFiles = async (
    files = {}
) => {
    const allFiles = [
        ...(files.img || []),
        ...(files.images || []),
    ];

    for (const file of allFiles) {
        if (!file.filename) {
            continue;
        }

        const filePath = path.join(
            process.cwd(),
            "uploads",
            "products",
            file.filename
        );

        try {
            await fs.unlink(filePath);
        } catch (error) {
            if (error.code !== "ENOENT") {
                console.error(
                    "Failed to delete uploaded file:",
                    error.message
                );
            }
        }
    }
};

/*
 * Prepare all product image fields for frontend.
 *
 * Adjust the field names here according to
 * your Product schema.
 */
const prepareProduct = (product) => {
    if (!product) {
        return product;
    }

    const preparedProduct = {
        ...product,
    };

    /*
     * Single image field
     */
    if (preparedProduct.img) {
        preparedProduct.img =
            prepareImageUrl(
                preparedProduct.img
            );
    }

    /*
     * Multiple images
     */
    if (
        Array.isArray(
            preparedProduct.images
        )
    ) {
        preparedProduct.images =
            preparedProduct.images.map(
                prepareImageUrl
            );
    }

    return preparedProduct;
};



const generateUniqueSlug = async (name) => {
    const baseSlug = slugify(name, {
        lower: true,
        strict: true,
        trim: true,
    });

    let slug = baseSlug;
    let counter = 1;

    while (
        await Product.exists({
            slug,
        })
    ) {
        slug = `${baseSlug}-${counter}`;

        counter++;
    }

    return slug;
};


/*
 * Create product
 */
const createProduct = async (productData) => {
    /*
     * Check SKU first.
     */
    const existingSku = await Product.findOne({
        sku: productData.sku,
    });

    if (existingSku) {
        const error = new Error(
            "A product with this SKU already exists."
        );

        error.statusCode = 409;

        throw error;
    }

    /*
     * Validate pricing.
     */
    if (
        productData.compareAtPrice !== null &&
        productData.compareAtPrice !== undefined &&
        productData.compareAtPrice <
        productData.price
    ) {
        const error = new Error(
            "Compare-at price must be greater than or equal to the selling price."
        );

        error.statusCode = 400;

        throw error;
    }

    /*
     * Generate slug automatically.
     */
    const slug = await generateUniqueSlug(
        productData.name
    );

    const product = await Product.create({
        ...productData,
        slug,
    });

    return product;
};

/*
 * Get products
 */
const getProducts = async ({
    page = 1,
    limit = 20,
    search,
    sort = "newest",
    featured,
    minPrice,
    maxPrice,
    isActive,
}) => {
    const filter = {};

    /*
     * Search
     */
    if (search?.trim()) {
        filter.$or = [
            {
                name: {
                    $regex: search.trim(),
                    $options: "i",
                },
            },
            {
                sku: {
                    $regex: search.trim(),
                    $options: "i",
                },
            },
            {
                brand: {
                    $regex: search.trim(),
                    $options: "i",
                },
            },
        ];
    }

    /*
     * Active / Inactive filter
     */
    if (isActive !== undefined) {
        filter.isActive =
            isActive === true ||
            isActive === "true";
    }

    /*
     * Featured products
     */
    if (featured !== undefined) {
        filter.isFeatured =
            featured === "true";
    }

    /*
     * Price filter
     */
    if (
        minPrice !== undefined ||
        maxPrice !== undefined
    ) {
        filter.price = {};

        if (minPrice !== undefined) {
            filter.price.$gte = minPrice;
        }

        if (maxPrice !== undefined) {
            filter.price.$lte = maxPrice;
        }
    }

    /*
     * Sorting
     */
    let sortOption = {
        createdAt: -1,
    };

    switch (sort) {
        case "oldest":
            sortOption = {
                createdAt: 1,
            };
            break;

        case "price_asc":
            sortOption = {
                price: 1,
                createdAt: -1,
            };
            break;

        case "price_desc":
            sortOption = {
                price: -1,
                createdAt: -1,
            };
            break;

        case "name_asc":
            sortOption = {
                name: 1,
            };
            break;

        case "name_desc":
            sortOption = {
                name: -1,
            };
            break;

        case "newest":
        default:
            sortOption = {
                createdAt: -1,
            };
    }

    const skip =
        (page - 1) * limit;

    const [
        products,
        total,
    ] = await Promise.all([
        Product.find(filter)
            .sort(sortOption)
            .skip(skip)
            .limit(limit)
            .lean(),

        Product.countDocuments(filter),
    ]);

    /*
  * Convert image paths into complete URLs.
  */
    const preparedProducts =
        products.map(
            prepareProduct
        );

    const totalPages =
        Math.ceil(total / limit);

    return {
        products: preparedProducts,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage:
                page < totalPages,
            hasPreviousPage:
                page > 1,
        },
    };
};

/*
 * Get products for frontend
 */
const getProductsFrontend = async ({
    page = 1,
    limit = 20,
    search,
    sort = "newest",
    featured,
    minPrice,
    maxPrice,
    isActive,
}) => {
    const filter = {isActive: true};

    /*
     * Search
     */
    if (search?.trim()) {
        filter.$or = [
            {
                name: {
                    $regex: search.trim(),
                    $options: "i",
                },
            },
            {
                sku: {
                    $regex: search.trim(),
                    $options: "i",
                },
            },
            {
                brand: {
                    $regex: search.trim(),
                    $options: "i",
                },
            },
        ];
    }

    /*
     * Active / Inactive filter
     */
    if (isActive !== undefined) {
        filter.isActive =
            isActive === true ||
            isActive === "true";
    }

    /*
     * Featured products
     */
    if (featured !== undefined) {
        filter.isFeatured =
            featured === "true";
    }

    /*
     * Price filter
     */
    if (
        minPrice !== undefined ||
        maxPrice !== undefined
    ) {
        filter.price = {};

        if (minPrice !== undefined) {
            filter.price.$gte = minPrice;
        }

        if (maxPrice !== undefined) {
            filter.price.$lte = maxPrice;
        }
    }

    /*
     * Sorting
     */
    let sortOption = {
        createdAt: -1,
    };

    switch (sort) {
        case "oldest":
            sortOption = {
                createdAt: 1,
            };
            break;

        case "price_asc":
            sortOption = {
                price: 1,
                createdAt: -1,
            };
            break;

        case "price_desc":
            sortOption = {
                price: -1,
                createdAt: -1,
            };
            break;

        case "name_asc":
            sortOption = {
                name: 1,
            };
            break;

        case "name_desc":
            sortOption = {
                name: -1,
            };
            break;

        case "newest":
        default:
            sortOption = {
                createdAt: -1,
            };
    }

    const skip =
        (page - 1) * limit;

    const [
        products,
        total,
    ] = await Promise.all([
        Product.find(filter)
            .sort(sortOption)
            .skip(skip)
            .limit(limit)
            .lean(),

        Product.countDocuments(filter),
    ]);

    /*
  * Convert image paths into complete URLs.
  */
    const preparedProducts =
        products.map(
            prepareProduct
        );

    const totalPages =
        Math.ceil(total / limit);

    return {
        products: preparedProducts,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage:
                page < totalPages,
            hasPreviousPage:
                page > 1,
        },
    };
};

/*
 * Get product by slug
 */
const getProductBySlug = async (slug) => {
    const product =
        await Product.findOne({
            slug,
            isActive: true,
        }).lean();

    if (!product) {
        const error = new Error(
            "Product not found."
        );

        error.statusCode = 404;

        throw error;
    }

    return prepareProduct(product);
};

/*
 * Get product by ID
 *
 * Used internally for admin operations.
 */
const getProductById = async (id) => {
    const product =
        await Product.findById(id);

    if (!product) {
        const error = new Error(
            "Product not found."
        );

        error.statusCode = 404;

        throw error;
    }

    return product;
};

/*
 * Update product
 */
const updateProduct = async (
    productId,
    updateData
) => {
    const product =
        await Product.findById(productId);

    if (!product) {
        const error = new Error(
            "Product not found."
        );

        error.statusCode = 404;

        throw error;
    }

    /*
     * Check slug uniqueness
     */
    if (updateData.slug) {
        const existingSlug =
            await Product.findOne({
                slug: updateData.slug,
                _id: {
                    $ne: productId,
                },
            });

        if (existingSlug) {
            const error = new Error(
                "A product with this slug already exists."
            );

            error.statusCode = 409;

            throw error;
        }
    }

    /*
     * Check SKU uniqueness
     */
    if (updateData.sku) {
        const existingSku =
            await Product.findOne({
                sku: updateData.sku,
                _id: {
                    $ne: productId,
                },
            });

        if (existingSku) {
            const error = new Error(
                "A product with this SKU already exists."
            );

            error.statusCode = 409;

            throw error;
        }
    }

    /*
     * Validate final price relationship.
     *
     * If only price or only compareAtPrice is being
     * updated, compare against the existing value.
     */
    const finalPrice =
        updateData.price !== undefined
            ? updateData.price
            : product.price;

    const finalCompareAtPrice =
        updateData.compareAtPrice !== undefined
            ? updateData.compareAtPrice
            : product.compareAtPrice;

    if (
        finalCompareAtPrice !== null &&
        finalCompareAtPrice !== undefined &&
        finalCompareAtPrice < finalPrice
    ) {
        const error = new Error(
            "Compare-at price must be greater than or equal to the selling price."
        );

        error.statusCode = 400;

        throw error;
    }

    Object.assign(
        product,
        updateData
    );

    await product.save();

    return prepareProduct(product);
};

/*
 * Delete product
 *
 * We use soft deletion rather than physically
 * deleting the document.
 */
const deleteProduct = async (
    productId
) => {
    const product =
        await Product.findById(productId);

    if (!product) {
        const error = new Error(
            "Product not found."
        );

        error.statusCode = 404;

        throw error;
    }

    /*
     * Delete product images from the server.
     */
    await deleteProductFiles(product);

    /*
     * Permanently delete the product
     * from MongoDB.
     */
    await Product.deleteOne({
        _id: productId,
    });

    return true;
};

const deactivateProduct = async (id) => {
    const product =
        await Product.findById(id);

    if (!product) {
        const error = new Error(
            "Product not found."
        );

        error.statusCode = 404;

        throw error;
    }

    product.isActive = false;
    await product.save();

    return product;
};

const toggleActiveStatus = async (id) => {
    const product =
        await Product.findById(id);

    if (!product) {
        const error = new Error(
            "Product not found."
        );

        error.statusCode = 404;

        throw error;
    }

    product.isActive = !product.isActive;
    await product.save();

    return product;
};

module.exports = {
    createProduct,
    getProducts,
    getProductsFrontend,
    getProductBySlug,
    getProductById,
    updateProduct,
    deleteProduct,
    deleteUploadedFiles,
    deactivateProduct,
    toggleActiveStatus,
};