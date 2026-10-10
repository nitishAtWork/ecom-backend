const Page = require("../models/Page");
const slugify = require("slugify");
const { deleteUploadedFile } = require("../utils/file");

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const getImagePath = (filename) =>
    `/uploads/pages/${filename}`;

const getImageUrl = (imagePath) => {
    if (!imagePath) return "";

    if (/^https?:\/\//i.test(imagePath)) {
        return imagePath;
    }

    const baseUrl = (process.env.BASE_URL || "").replace(/\/+$/, "");
    return `${baseUrl}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
};

const preparePage = (page) => {
    if (!page) return page;

    const result =
        typeof page.toObject === "function"
            ? page.toObject()
            : { ...page };

    result.img = getImageUrl(result.img);

    result.images = Array.isArray(result.images)
        ? result.images.map(getImageUrl)
        : [];

    return result;
};

const parseRemoveImages = (value) => {
    if (value === undefined || value === null || value === "") {
        return [];
    }

    if (Array.isArray(value)) {
        return value.filter(
            (item) => typeof item === "string" && item.trim()
        );
    }

    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);

            if (Array.isArray(parsed)) {
                return parsed.filter(
                    (item) => typeof item === "string" && item.trim()
                );
            }
        } catch {
            return [value.trim()].filter(Boolean);
        }
    }

    return [];
};

const normalizeImagePath = (value) => {
    if (typeof value !== "string") return "";

    let imagePath = value.trim();

    // Convert a full URL into a local upload path.
    imagePath = imagePath.replace(/^https?:\/\/[^/]+/i, "");

    return imagePath.startsWith("/")
        ? imagePath
        : `/${imagePath}`;
};

const cleanupUploadedFiles = async (files = []) => {
    for (const file of files) {
        try {
            await deleteUploadedFile(file);
        } catch (error) {
            console.error(
                "Failed to clean up uploaded page image:",
                file,
                error
            );
        }
    }
};

const getUploadedFiles = (req) => {
    const files = [];

    for (const field of ["img", "images"]) {
        for (const file of req.files?.[field] || []) {
            files.push(getImagePath(file.filename));
        }
    }

    return files;
};

/*
|--------------------------------------------------------------------------
| POST /api/pages
|--------------------------------------------------------------------------
*/

const createPage = async (req, res, next) => {
    const uploadedFiles = getUploadedFiles(req);

    try {
        const {
            name,
            slug: customSlug,
            shortDescription,
            description,
            extraDescription,
            videoLink,
            isCustomSlug,
            metaTitle,
            metaDescription,
            metaKeywords,
            isActive,
        } = req.body;

        if (!name || !name.trim()) {
            await cleanupUploadedFiles(uploadedFiles);

            return res.status(400).json({
                success: false,
                message: "Page name is required.",
            });
        }

        const trimmedName = name.trim();

        const existingPage = await Page.findOne({
            name: {
                $regex: `^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
                $options: "i",
            },
        });

        if (existingPage) {
            await cleanupUploadedFiles(uploadedFiles);

            return res.status(409).json({
                success: false,
                message: "Page name already exists.",
            });
        }

        const customSlugEnabled =
            isCustomSlug === true || isCustomSlug === "true";

        const requestedSlug = customSlugEnabled
            ? slugify(String(customSlug || "").trim(), {
                lower: true,
                strict: true,
            })
            : "";

        const generatedSlug = slugify(trimmedName, {
            lower: true,
            strict: true,
        });

        const finalSlug = requestedSlug || generatedSlug;

        if (!finalSlug) {
            await cleanupUploadedFiles(uploadedFiles);

            return res.status(400).json({
                success: false,
                message: "Unable to generate a valid page slug.",
            });
        }

        const existingSlug = await Page.findOne({
            slug: finalSlug,
        });

        if (existingSlug) {
            await cleanupUploadedFiles(uploadedFiles);

            return res.status(409).json({
                success: false,
                message: "Page slug already exists.",
            });
        }

        const imgFile = req.files?.img?.[0];

        const images = (req.files?.images || []).map(
            (file) => getImagePath(file.filename)
        );

        const page = await Page.create({
            name: trimmedName,
            slug: finalSlug,
            shortDescription,
            description,
            extraDescription,
            img: imgFile ? getImagePath(imgFile.filename) : "",
            images,
            videoLink,
            isCustomSlug: customSlugEnabled,
            metaTitle,
            metaDescription,
            metaKeywords,
            ...(isActive !== undefined
                ? {
                    isActive:
                        isActive === true || isActive === "true",
                }
                : {}),
        });

        return res.status(201).json({
            success: true,
            message: "Page created successfully.",
            data: {
                page: preparePage(page),
            },
        });
    } catch (error) {
        await cleanupUploadedFiles(uploadedFiles);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Page name or slug already exists.",
            });
        }

        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| PATCH /api/pages/:id
|--------------------------------------------------------------------------
*/

const updatePage = async (req, res, next) => {
    const uploadedFiles = getUploadedFiles(req);
    let databaseUpdated = false;

    try {
        const { id } = req.params;

        const page = await Page.findById(id);

        if (!page) {
            await cleanupUploadedFiles(uploadedFiles);

            return res.status(404).json({
                success: false,
                message: "Page not found.",
            });
        }

        const {
            name,
            slug: requestedSlug,
            shortDescription,
            description,
            extraDescription,
            videoLink,
            isCustomSlug,
            metaTitle,
            metaDescription,
            metaKeywords,
            isActive,
        } = req.body;

        if (name !== undefined && !name.trim()) {
            await cleanupUploadedFiles(uploadedFiles);

            return res.status(400).json({
                success: false,
                message: "Page name cannot be empty.",
            });
        }

        const nextName =
            name !== undefined ? name.trim() : page.name;

        if (nextName.toLowerCase() !== page.name.toLowerCase()) {
            const escapedName = nextName.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );

            const duplicateName = await Page.findOne({
                _id: { $ne: id },
                name: {
                    $regex: `^${escapedName}$`,
                    $options: "i",
                },
            });

            if (duplicateName) {
                await cleanupUploadedFiles(uploadedFiles);

                return res.status(409).json({
                    success: false,
                    message: "Page name already exists.",
                });
            }
        }

        const customSlugEnabled =
            isCustomSlug !== undefined
                ? isCustomSlug === true || isCustomSlug === "true"
                : page.isCustomSlug;

        let nextSlug = page.slug;

        if (customSlugEnabled) {
            const customSlug = slugify(
                String(
                    requestedSlug !== undefined
                        ? requestedSlug
                        : page.slug || ""
                ).trim(),
                {
                    lower: true,
                    strict: true,
                }
            );

            if (!customSlug) {
                await cleanupUploadedFiles(uploadedFiles);

                return res.status(400).json({
                    success: false,
                    message: "Please provide a valid custom slug.",
                });
            }

            nextSlug = customSlug;
        } else if (name !== undefined && !page.isCustomSlug) {
            nextSlug = slugify(nextName, {
                lower: true,
                strict: true,
            });
        }

        if (nextSlug !== page.slug) {
            const duplicateSlug = await Page.findOne({
                _id: { $ne: id },
                slug: nextSlug,
            });

            if (duplicateSlug) {
                await cleanupUploadedFiles(uploadedFiles);

                return res.status(409).json({
                    success: false,
                    message: "Page slug already exists.",
                });
            }
        }

        const removeImages = parseRemoveImages(
            req.body.removeImages
        ).map(normalizeImagePath);

        const oldMainImage = page.img || "";
        const oldImages = Array.isArray(page.images)
            ? page.images
            : [];

        const removeMainImage =
            req.body.removeMainImage === true ||
            req.body.removeMainImage === "true";

        const newMainFile = req.files?.img?.[0];

        const nextMainImage = newMainFile
            ? getImagePath(newMainFile.filename)
            : removeMainImage
                ? ""
                : oldMainImage;

        const remainingImages = oldImages.filter(
            (image) => !removeImages.includes(normalizeImagePath(image))
        );

        const newImages = (req.files?.images || []).map(
            (file) => getImagePath(file.filename)
        );

        const updateData = {
            name: nextName,
            slug: nextSlug,
            isCustomSlug: customSlugEnabled,
        };

        const optionalFields = {
            shortDescription,
            description,
            extraDescription,
            videoLink,
            metaTitle,
            metaDescription,
            metaKeywords,
        };

        for (const [key, value] of Object.entries(optionalFields)) {
            if (value !== undefined) {
                updateData[key] = value;
            }
        }

        updateData.img = nextMainImage;
        updateData.images = [
            ...remainingImages,
            ...newImages,
        ];

        if (isActive !== undefined) {
            updateData.isActive =
                isActive === true || isActive === "true";
        }

        // Never persist upload-management fields.
        delete updateData.removeImages;
        delete updateData.removeMainImage;

        const updatedPage = await Page.findByIdAndUpdate(
            id,
            { $set: updateData },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!updatedPage) {
            await cleanupUploadedFiles(uploadedFiles);

            return res.status(404).json({
                success: false,
                message: "Page not found.",
            });
        }

        databaseUpdated = true;

        // Best-effort cleanup after the database update succeeds.
        const filesToDelete = [];

        if (newMainFile && oldMainImage && oldMainImage !== nextMainImage) {
            filesToDelete.push(oldMainImage);
        }

        if (removeMainImage && oldMainImage && !newMainFile) {
            filesToDelete.push(oldMainImage);
        }

        filesToDelete.push(
            ...oldImages.filter((image) =>
                removeImages.includes(normalizeImagePath(image))
            )
        );

        await cleanupUploadedFiles(filesToDelete);

        return res.status(200).json({
            success: true,
            message: "Page updated successfully.",
            data: {
                page: preparePage(updatedPage),
            },
        });
    } catch (error) {
        // Do not delete new files if the database update already succeeded.
        if (!databaseUpdated) {
            await cleanupUploadedFiles(uploadedFiles);
        }

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Page name or slug already exists.",
            });
        }

        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| DELETE /api/pages/:id
|--------------------------------------------------------------------------
*/

const deletePage = async (req, res, next) => {
    try {
        const page = await Page.findById(req.params.id);

        if (!page) {
            return res.status(404).json({
                success: false,
                message: "Page not found.",
            });
        }

        await Page.findByIdAndDelete(req.params.id);

        // Delete files only after the database operation succeeds.
        await cleanupUploadedFiles([
            page.img,
            ...(Array.isArray(page.images) ? page.images : []),
        ]);

        return res.status(200).json({
            success: true,
            message: "Page deleted successfully.",
        });
    } catch (error) {
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| PATCH /api/pages/:id/toggle-status
|--------------------------------------------------------------------------
*/

const togglePageStatus = async (req, res, next) => {
    try {
        const page = await Page.findById(req.params.id);

        if (!page) {
            return res.status(404).json({
                success: false,
                message: "Page not found.",
            });
        }

        page.isActive = !page.isActive;
        await page.save();

        return res.status(200).json({
            success: true,
            message: "Page status updated successfully.",
            data: {
                isActive: page.isActive,
                page,
            },
        });
    } catch (error) {
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| GET /api/pages/:id
|--------------------------------------------------------------------------
*/

const getSinglePage = async (req, res, next) => {
    try {
        const page = await Page.findById(req.params.id).lean();

        if (!page) {
            return res.status(404).json({
                success: false,
                message: "Page not found.",
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                page: preparePage(page),
            },
        });
    } catch (error) {
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| GET /api/pages/slug/:slug
|--------------------------------------------------------------------------
*/

const getSinglePageBySlug = async (req, res, next) => {
    try {
        const page = await Page.findOne({
            slug: req.params.slug,
            isActive: true,
        })
            .select(
                "-isActive -updatedAt -createdAt -isCustomSlug -__v"
            )
            .lean();

        if (!page) {
            return res.status(404).json({
                success: false,
                message: "Page not found.",
            });
        }

        return res.status(200).json({
            success: true,
            data: preparePage(page),
        });
    } catch (error) {
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| GET /api/pages
|--------------------------------------------------------------------------
*/

const getAllPages = async (req, res, next) => {
    try {
        const pages = await Page.find()
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            data: {
                pages: pages.map(preparePage),
            },
        });
    } catch (error) {
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| GET /api/pages/frontend
|--------------------------------------------------------------------------
*/

const getAllPagesFront = async (req, res, next) => {
    try {
        const pages = await Page.find({
            isActive: true,
        })
            .select("-isActive -createdAt -updatedAt -__v")
            .sort({ name: 1 })
            .lean();

        return res.status(200).json({
            success: true,
            data: pages.map(preparePage),
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createPage,
    getAllPages,
    getAllPagesFront,
    getSinglePageBySlug,
    updatePage,
    deletePage,
    getSinglePage,
    togglePageStatus,
};
