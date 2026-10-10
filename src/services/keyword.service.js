const Keyword = require("../models/Keyword");
const slugify = require("slugify");
const fs = require("fs").promises;
const path = require("path");

const BASE_URL = (
    process.env.BASE_URL || ""
).replace(/\/$/, "");

/*
|--------------------------------------------------------------------------
| Prepare Image URL
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Delete Uploaded Keyword Files
|--------------------------------------------------------------------------
*/

const deleteUploadedFiles = async (
    files = {}
) => {
    const allFiles = [
        ...(files.img || []),
        ...(files.images || []),
    ];

    for (const file of allFiles) {
        if (!file?.filename) {
            continue;
        }

        const filePath = path.join(
            process.cwd(),
            "uploads",
            "keywords",
            file.filename
        );

        try {
            await fs.unlink(filePath);
        } catch (error) {
            if (error.code !== "ENOENT") {
                console.error(
                    "Failed to delete uploaded keyword file:",
                    error.message
                );
            }
        }
    }
};

/*
|--------------------------------------------------------------------------
| Delete Keyword Files From Server
|--------------------------------------------------------------------------
|
| Used when permanently deleting a keyword.
|
*/

const deleteKeywordFiles = async (keyword) => {
    if (!keyword) {
        return;
    }

    const files = [];

    if (keyword.img) {
        files.push(keyword.img);
    }

    if (Array.isArray(keyword.images)) {
        files.push(...keyword.images);
    }

    for (const image of files) {
        if (!image) {
            continue;
        }

        /*
         * Remove full BASE_URL if the database somehow
         * contains a complete URL.
         */
        const relativeImage = image.startsWith(BASE_URL)
            ? image.replace(BASE_URL, "")
            : image;

        const cleanPath = relativeImage.replace(
            /^\/+/,
            ""
        );

        const filePath = path.join(
            process.cwd(),
            cleanPath
        );

        try {
            await fs.unlink(filePath);
        } catch (error) {
            if (error.code !== "ENOENT") {
                console.error(
                    "Failed to delete keyword image:",
                    error.message
                );
            }
        }
    }
};

/*
|--------------------------------------------------------------------------
| Prepare Keyword
|--------------------------------------------------------------------------
|
| Convert image paths into complete frontend URLs.
|--------------------------------------------------------------------------
*/

const prepareKeyword = (keyword) => {
    if (!keyword) {
        return keyword;
    }

    const preparedKeyword = {
        ...keyword,
    };

    /*
     * Single image.
     */
    if (preparedKeyword.img) {
        preparedKeyword.img =
            prepareImageUrl(
                preparedKeyword.img
            );
    }

    /*
     * Multiple images.
     */
    if (
        Array.isArray(
            preparedKeyword.images
        )
    ) {
        preparedKeyword.images =
            preparedKeyword.images.map(
                prepareImageUrl
            );
    }

    return preparedKeyword;
};

/*
|--------------------------------------------------------------------------
| Generate Unique Slug
|--------------------------------------------------------------------------
*/

const generateUniqueSlug = async (
    name,
    excludeId = null
) => {
    const baseSlug = slugify(name, {
        lower: true,
        strict: true,
        trim: true,
    });

    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const query = {
            slug,
        };

        /*
         * When updating a keyword, allow its
         * existing slug to remain.
         */
        if (excludeId) {
            query._id = {
                $ne: excludeId,
            };
        }

        const exists =
            await Keyword.exists(query);

        if (!exists) {
            break;
        }

        slug = `${baseSlug}-${counter}`;
        counter++;
    }

    return slug;
};

/*
|--------------------------------------------------------------------------
| Create Keyword
|--------------------------------------------------------------------------
*/
/**
 * --------------------------------------------------------------------------
 * Find Keyword By Name
 * --------------------------------------------------------------------------
 *
 * Case-insensitive exact name lookup.
 *
 * Example:
 * "Dildo"
 * "dildo"
 * "DILDO"
 *
 * are treated as the same keyword name.
 * --------------------------------------------------------------------------
 */

const findKeywordByName = async (name, excludeId = null) => {
    if (!name?.trim()) {
        return null;
    }

    const query = {
        name: name.trim(),
    };

    if (excludeId) {
        query._id = {
            $ne: excludeId,
        };
    }

    return Keyword.findOne(query)
        .collation({
            locale: "en",
            strength: 2,
        })
        .lean();
};


/**
 * --------------------------------------------------------------------------
 * Create Keyword
 * --------------------------------------------------------------------------
 */

const createKeyword = async (keywordData) => {
    const name = keywordData.name?.trim();

    if (!name) {
        const error = new Error("Keyword name is required.");
        error.statusCode = 400;
        throw error;
    }

    /**
     * Check duplicate keyword name.
     */
    const existingKeyword = await findKeywordByName(name);

    if (existingKeyword) {
        const error = new Error(
            `Keyword "${name}" already exists.`
        );

        error.statusCode = 409;
        error.code = "KEYWORD_NAME_EXISTS";

        throw error;
    }

    /**
     * Generate slug automatically from name.
     */
    const slug = await generateUniqueSlug(name);

    try {
        const keyword = await Keyword.create({
            ...keywordData,
            name,
            slug,
        });

        return prepareKeyword(
            keyword.toObject()
        );
    } catch (error) {
        /**
         * MongoDB duplicate key protection.
         *
         * This handles race conditions where two requests
         * try to create the same keyword at the same time.
         */
        if (error.code === 11000) {
            if (error.keyPattern?.name) {
                const duplicateError = new Error(
                    `Keyword "${name}" already exists.`
                );

                duplicateError.statusCode = 409;
                duplicateError.code = "KEYWORD_NAME_EXISTS";

                throw duplicateError;
            }

            if (error.keyPattern?.slug) {
                const duplicateError = new Error(
                    "Generated keyword slug already exists. Please try again."
                );

                duplicateError.statusCode = 409;
                duplicateError.code = "KEYWORD_SLUG_EXISTS";

                throw duplicateError;
            }
        }

        throw error;
    }
};


/**
 * --------------------------------------------------------------------------
 * Update Keyword
 * --------------------------------------------------------------------------
 */

const updateKeyword = async (
    keywordId,
    updateData
) => {
    const keyword = await Keyword.findById(
        keywordId
    );

    if (!keyword) {
        const error = new Error(
            "Keyword not found."
        );

        error.statusCode = 404;

        throw error;
    }

    /**
     * Never allow the frontend to manually control slug.
     */
    delete updateData.slug;

    /**
     * Check whether name was actually changed.
     */
    const newName = updateData.name?.trim();

    const nameChanged =
        newName &&
        newName.toLowerCase() !==
            keyword.name.trim().toLowerCase();

    /**
     * If name changes:
     *
     * 1. Check if another keyword already has this name.
     * 2. Generate a completely new slug.
     */
    if (nameChanged) {
        const existingKeyword =
            await findKeywordByName(
                newName,
                keywordId
            );

        if (existingKeyword) {
            const error = new Error(
                `Keyword "${newName}" already exists.`
            );

            error.statusCode = 409;
            error.code = "KEYWORD_NAME_EXISTS";

            throw error;
        }

        /**
         * Update name.
         */
        updateData.name = newName;

        /**
         * Generate new slug based on new name.
         *
         * Example:
         *
         * Old:
         * name: "Sex Toys"
         * slug: "sex-toys"
         *
         * New:
         * name: "Premium Sex Toys"
         * slug: "premium-sex-toys"
         */
        updateData.slug =
            await generateUniqueSlug(
                newName,
                keywordId
            );
    } else {
        /**
         * Name did not change.
         *
         * Keep the existing name and slug.
         */
        delete updateData.name;
        delete updateData.slug;
    }

    /**
     * Update document.
     */
    Object.assign(
        keyword,
        updateData
    );

    try {
        await keyword.save();
    } catch (error) {
        /**
         * Extra database-level protection
         * against duplicate names/slugs.
         */
        if (error.code === 11000) {
            if (error.keyPattern?.name) {
                const duplicateError = new Error(
                    `Keyword "${newName}" already exists.`
                );

                duplicateError.statusCode = 409;
                duplicateError.code = "KEYWORD_NAME_EXISTS";

                throw duplicateError;
            }

            if (error.keyPattern?.slug) {
                const duplicateError = new Error(
                    "Generated keyword slug already exists."
                );

                duplicateError.statusCode = 409;
                duplicateError.code = "KEYWORD_SLUG_EXISTS";

                throw duplicateError;
            }
        }

        throw error;
    }

    return prepareKeyword(
        keyword.toObject()
    );
};
/*
|--------------------------------------------------------------------------
| Get Keywords - Admin
|--------------------------------------------------------------------------
*/

const getKeywords = async ({
    page = 1,
    limit = 20,
    search,
    sort = "newest",
    isActive,
}) => {
    const filter = {};

    /*
     * Search.
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
                slug: {
                    $regex: search.trim(),
                    $options: "i",
                },
            },
            {
                shortDescription: {
                    $regex: search.trim(),
                    $options: "i",
                },
            },
            {
                metaKeywords: {
                    $regex: search.trim(),
                    $options: "i",
                },
            },
        ];
    }

    /*
     * Active / inactive filter.
     */
    if (isActive !== undefined) {
        filter.isActive =
            isActive === true ||
            isActive === "true";
    }

    /*
     * Sorting.
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

        case "name_asc":
            sortOption = {
                name: 1,
                createdAt: -1,
            };
            break;

        case "name_desc":
            sortOption = {
                name: -1,
                createdAt: -1,
            };
            break;

        case "newest":
        default:
            sortOption = {
                createdAt: -1,
            };
            break;
    }

    const skip =
        (page - 1) * limit;

    const [
        keywords,
        total,
    ] = await Promise.all([
        Keyword.find(filter)
            .sort(sortOption)
            .skip(skip)
            .limit(limit)
            .lean(),

        Keyword.countDocuments(filter),
    ]);

    const preparedKeywords =
        keywords.map(
            prepareKeyword
        );

    const totalPages =
        Math.ceil(total / limit);

    return {
        keywords: preparedKeywords,

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
|--------------------------------------------------------------------------
| Get Keywords - Frontend
|--------------------------------------------------------------------------
|
| Only active keywords are returned.
|--------------------------------------------------------------------------
*/

const getKeywordsFrontend = async ({
    page = 1,
    limit = 20,
    search,
    sort = "newest",
}) => {
    const filter = {
        isActive: true,
    };

    /*
     * Search.
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
                slug: {
                    $regex: search.trim(),
                    $options: "i",
                },
            },
            {
                shortDescription: {
                    $regex: search.trim(),
                    $options: "i",
                },
            },
            {
                metaKeywords: {
                    $regex: search.trim(),
                    $options: "i",
                },
            },
        ];
    }

    /*
     * Sorting.
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

        case "name_asc":
            sortOption = {
                name: 1,
                createdAt: -1,
            };
            break;

        case "name_desc":
            sortOption = {
                name: -1,
                createdAt: -1,
            };
            break;

        case "newest":
        default:
            sortOption = {
                createdAt: -1,
            };
            break;
    }

    const skip =
        (page - 1) * limit;

    const [
        keywords,
        total,
    ] = await Promise.all([
        Keyword.find(filter)
            .sort(sortOption)
            .skip(skip)
            .limit(limit)
            .lean(),

        Keyword.countDocuments(filter),
    ]);

    const preparedKeywords =
        keywords.map(
            prepareKeyword
        );

    const totalPages =
        Math.ceil(total / limit);

    return {
        keywords: preparedKeywords,

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
|--------------------------------------------------------------------------
| Get Keyword By Slug
|--------------------------------------------------------------------------
*/

const getKeywordBySlug = async (
    slug
) => {
    const keyword =
        await Keyword.findOne({
            slug,
            isActive: true,
        }).lean();

    if (!keyword) {
        const error = new Error(
            "Keyword not found."
        );

        error.statusCode = 404;

        throw error;
    }

    return prepareKeyword(keyword);
};

/*
|--------------------------------------------------------------------------
| Get Keyword By ID
|--------------------------------------------------------------------------
|
| Used internally for admin operations.
|--------------------------------------------------------------------------
*/

const getKeywordById = async (
    id
) => {
    const keyword =
        await Keyword.findById(id);

    if (!keyword) {
        const error = new Error(
            "Keyword not found."
        );

        error.statusCode = 404;

        throw error;
    }

    return keyword;
};

/*
|--------------------------------------------------------------------------
| Delete Keyword
|--------------------------------------------------------------------------
|
| Permanently deletes keyword and its
| associated images.
|--------------------------------------------------------------------------
*/

const deleteKeyword = async (
    keywordId
) => {
    const keyword =
        await Keyword.findById(
            keywordId
        );

    if (!keyword) {
        const error = new Error(
            "Keyword not found."
        );

        error.statusCode = 404;

        throw error;
    }

    /*
     * Delete keyword images.
     */
    await deleteKeywordFiles(
        keyword
    );

    /*
     * Permanently delete keyword.
     */
    await Keyword.deleteOne({
        _id: keywordId,
    });

    return true;
};

/*
|--------------------------------------------------------------------------
| Deactivate Keyword
|--------------------------------------------------------------------------
*/

const deactivateKeyword = async (
    id
) => {
    const keyword =
        await Keyword.findById(id);

    if (!keyword) {
        const error = new Error(
            "Keyword not found."
        );

        error.statusCode = 404;

        throw error;
    }

    keyword.isActive = false;

    await keyword.save();

    return prepareKeyword(
        keyword.toObject()
    );
};

/*
|--------------------------------------------------------------------------
| Toggle Active Status
|--------------------------------------------------------------------------
*/

const toggleActiveStatus = async (
    id
) => {
    const keyword =
        await Keyword.findById(id);

    if (!keyword) {
        const error = new Error(
            "Keyword not found."
        );

        error.statusCode = 404;

        throw error;
    }

    keyword.isActive =
        !keyword.isActive;

    await keyword.save();

    return prepareKeyword(
        keyword.toObject()
    );
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

    deleteUploadedFiles,

    deactivateKeyword,

    toggleActiveStatus,
};
