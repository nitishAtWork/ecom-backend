const NatureOfBusiness = require("../models/NatureOfBusiness");
const Keyword = require("../models/Keyword");
const slugify = require("slugify");

/* =========================================================
   CREATE NATURE OF BUSINESS
========================================================= */

const createNatureOfBusiness = async (req, res) => {
    try {
        const {
            name,
            shortDescription,
            description,
            extraDescription,
            metaTitle,
            metaDescription,
            metaKeywords,
            isActive,
        } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Nature of business name is required",
            });
        }

        const trimmedName = name.trim();

        // Case-insensitive duplicate name check
        const existingNature = await NatureOfBusiness.findOne({
            name: {
                $regex: `^${trimmedName}$`,
                $options: "i",
            },
        });

        if (existingNature) {
            return res.status(400).json({
                message: "Nature of business name already exists",
            });
        }

        // Generate slug automatically
        const generatedSlug = slugify(trimmedName, {
            lower: true,
            strict: true,
            trim: true,
        });

        // Check slug duplicate
        const existingSlug = await NatureOfBusiness.findOne({
            slug: generatedSlug,
        });

        if (existingSlug) {
            return res.status(400).json({
                message: "A nature of business with this slug already exists",
            });
        }

        const newNature = await NatureOfBusiness.create({
            name: trimmedName,
            slug: generatedSlug,
            shortDescription: shortDescription?.trim() || "",
            description: description?.trim() || "",
            extraDescription: extraDescription?.trim() || "",
            metaTitle: metaTitle?.trim() || "",
            metaDescription: metaDescription?.trim() || "",
            metaKeywords: metaKeywords?.trim() || "",
            isActive:
                isActive === undefined
                    ? true
                    : isActive === true || isActive === "true",
        });

        return res.status(201).json({
            message: "Nature of business created successfully",
            natureOfBusiness: newNature,
        });
    } catch (error) {
        console.error(
            "Create nature of business error:",
            error
        );

        if (error.code === 11000) {
            return res.status(400).json({
                message:
                    "Nature of business name or slug already exists",
            });
        }

        return res.status(500).json({
            message:
                "Server error, can't create nature of business",
        });
    }
};


/* =========================================================
   UPDATE NATURE OF BUSINESS
========================================================= */

const updateNatureOfBusiness = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            shortDescription,
            description,
            extraDescription,
            metaTitle,
            metaDescription,
            metaKeywords,
            isActive,
        } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Nature of business name is required",
            });
        }

        const nature = await NatureOfBusiness.findById(id);

        if (!nature) {
            return res.status(404).json({
                message: "Nature of business not found",
            });
        }

        const trimmedName = name.trim();

        // Check duplicate name excluding current record
        const existingNature = await NatureOfBusiness.findOne({
            _id: { $ne: id },
            name: {
                $regex: `^${trimmedName}$`,
                $options: "i",
            },
        });

        if (existingNature) {
            return res.status(400).json({
                message: "Nature of business name already exists",
            });
        }

        // Check whether name changed
        const nameChanged =
            nature.name.trim().toLowerCase() !==
            trimmedName.toLowerCase();

        nature.name = trimmedName;

        // Generate new slug only when name changes
        if (nameChanged) {
            const generatedSlug = slugify(trimmedName, {
                lower: true,
                strict: true,
                trim: true,
            });

            const existingSlug =
                await NatureOfBusiness.findOne({
                    _id: { $ne: id },
                    slug: generatedSlug,
                });

            if (existingSlug) {
                return res.status(400).json({
                    message:
                        "A nature of business with this slug already exists",
                });
            }

            nature.slug = generatedSlug;
        }

        nature.shortDescription =
            shortDescription?.trim() || "";

        nature.description =
            description?.trim() || "";

        nature.extraDescription =
            extraDescription?.trim() || "";

        nature.metaTitle =
            metaTitle?.trim() || "";

        nature.metaDescription =
            metaDescription?.trim() || "";

        nature.metaKeywords =
            metaKeywords?.trim() || "";

        if (isActive !== undefined) {
            nature.isActive =
                isActive === true ||
                isActive === "true";
        }

        const updatedNature = await nature.save();

        return res.status(200).json({
            message:
                "Nature of business updated successfully",
            natureOfBusiness: updatedNature,
        });
    } catch (error) {
        console.error(
            "Update nature of business error:",
            error
        );

        if (error.code === 11000) {
            return res.status(400).json({
                message:
                    "Nature of business name or slug already exists",
            });
        }

        return res.status(500).json({
            message:
                "Server error, can't update nature of business",
        });
    }
};


/* =========================================================
   DELETE NATURE OF BUSINESS
========================================================= */

const deleteNatureOfBusiness = async (req, res) => {
    try {
        const { id } = req.params;

        const nature = await NatureOfBusiness.findById(id);

        if (!nature) {
            return res.status(404).json({
                message: "Nature of business not found",
            });
        }

        await NatureOfBusiness.findByIdAndDelete(id);

        return res.status(200).json({
            message:
                "Nature of business deleted successfully",
        });
    } catch (error) {
        console.error(
            "Delete nature of business error:",
            error
        );

        return res.status(500).json({
            message:
                "Server error, can't delete nature of business",
        });
    }
};


/* =========================================================
   TOGGLE STATUS
========================================================= */

const toggleNatureOfBusinessStatus = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        const nature = await NatureOfBusiness.findById(id);

        if (!nature) {
            return res.status(404).json({
                message: "Nature of business not found",
            });
        }

        nature.isActive = !nature.isActive;

        await nature.save();

        return res.status(200).json({
            message:
                "Nature of business status updated successfully",
            isActive: nature.isActive,
        });
    } catch (error) {
        console.error(
            "Toggle nature of business status error:",
            error
        );

        return res.status(500).json({
            message:
                "Server error, can't toggle status",
        });
    }
};


/* =========================================================
   GET SINGLE NATURE OF BUSINESS
========================================================= */

const getSingleNatureOfBusiness = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        const nature =
            await NatureOfBusiness.findById(id);

        if (!nature) {
            return res.status(404).json({
                message: "Nature of business not found",
            });
        }

        return res.status(200).json({
            message:
                "Nature of business retrieved successfully",
            natureOfBusiness: nature,
        });
    } catch (error) {
        console.error(
            "Get single nature of business error:",
            error
        );

        return res.status(500).json({
            message:
                "Server error, can't retrieve nature of business",
        });
    }
};


/* =========================================================
   GET ALL NATURE OF BUSINESS
========================================================= */

const getAllNatureOfBusiness = async (
    req,
    res
) => {
    try {
        const natures =
            await NatureOfBusiness.find().sort({
                createdAt: -1,
            });

        return res.status(200).json({
            message:
                "Nature of business retrieved successfully",
            natureOfBusiness: natures,
        });
    } catch (error) {
        console.error(
            "Get all nature of business error:",
            error
        );

        return res.status(500).json({
            message:
                "Server error, can't retrieve nature of business",
        });
    }
};


/* =========================================================
   GET ACTIVE NATURE OF BUSINESS
========================================================= */

const getAllActiveNatureOfBusiness = async (
    req,
    res
) => {
    try {
        const natures =
            await NatureOfBusiness.find({
                isActive: true,
            })
                .select(
                    "-__v -createdAt -updatedAt"
                )
                .sort({
                    name: 1,
                });

        return res.status(200).json({
            message:
                "Active nature of business retrieved successfully",
            data: natures,
        });
    } catch (error) {
        console.error(
            "Get all active nature of business error:",
            error
        );

        return res.status(500).json({
            message:
                "Server error, can't retrieve active nature of business",
        });
    }
};


/* =========================================================
   NATURE OF BUSINESS FRONTEND
========================================================= */

/*
    Example:

    /api/nature-of-business/frontend/:natureSlug/:keywordSlug

    natureSlug:
        consulting

    keywordSlug:
        delhi

    Nature of Business:
        "Best keyword consulting services in keyword"

    Keyword:
        "Delhi"

    Response:
        "Best Delhi consulting services in Delhi"
*/

const natureOfBusinessFrontend = async (
    req,
    res
) => {
    try {
        const {
            natureSlug,
            keywordSlug,
        } = req.params;

        if (!natureSlug) {
            return res.status(400).json({
                message:
                    "Nature of business slug is required",
            });
        }

        if (!keywordSlug) {
            return res.status(400).json({
                message: "Keyword slug is required",
            });
        }

        // ---------------------------------------------
        // Get Nature of Business
        // ---------------------------------------------

        const doc =
            await NatureOfBusiness.findOne({
                slug: natureSlug,
                isActive: true,
            }).select(
                "-isActive -createdAt -updatedAt -__v"
            );

        if (!doc) {
            return res.status(404).json({
                message:
                    "Nature of business doesn't exist",
            });
        }

        // ---------------------------------------------
        // Get Keyword
        // Keyword is ONLY used here
        // ---------------------------------------------

        const keyword =
            await Keyword.findOne({
                slug: keywordSlug,
                isActive: true,
            }).lean();

        if (!keyword) {
            return res.status(404).json({
                message: "Keyword doesn't exist",
            });
        }

        // Convert mongoose document to plain object
        const data = doc.toObject();

        // ---------------------------------------------
        // Replace "keyword"
        // ---------------------------------------------

        const replaceKeyword = (value) => {
            if (typeof value !== "string") {
                return value;
            }

            return value.replace(
                /keyword/gi,
                keyword.name
            );
        };

        data.name = replaceKeyword(data.name);

        data.shortDescription =
            replaceKeyword(
                data.shortDescription
            );

        data.description =
            replaceKeyword(data.description);

        data.extraDescription =
            replaceKeyword(
                data.extraDescription
            );

        data.metaTitle =
            replaceKeyword(data.metaTitle);

        data.metaDescription =
            replaceKeyword(
                data.metaDescription
            );

        data.metaKeywords =
            replaceKeyword(
                data.metaKeywords
            );

                    /* =====================================================
           KEYWORD MAIN IMAGE
        ===================================================== */

        if (keyword.img) {
            data.img =
                `${process.env.BASE_URL}${keyword.img}`;
        } else {
            data.img = "";
        }

              /* =====================================================
           KEYWORD ADDITIONAL IMAGES
        ===================================================== */

        data.images = Array.isArray(keyword.images)
            ? keyword.images
                .filter(Boolean)
                .map(
                    (image) =>
                        `${process.env.BASE_URL}${image}`
                )
            : [];

        return res.status(200).json({
            message:
                "Nature of business data fetched successfully",
            data,
        });
    } catch (error) {
        console.error(
            "Nature of business frontend error:",
            error
        );

        return res.status(500).json({
            message: "Server error",
        });
    }
};


/* =========================================================
   EXPORT
========================================================= */

module.exports = {
    createNatureOfBusiness,
    updateNatureOfBusiness,
    deleteNatureOfBusiness,
    toggleNatureOfBusinessStatus,
    getSingleNatureOfBusiness,
    getAllNatureOfBusiness,
    getAllActiveNatureOfBusiness,
    natureOfBusinessFrontend,
};