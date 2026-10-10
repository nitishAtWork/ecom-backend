const KeywordInCity = require("../models/KeywordInCity");
const Keyword = require("../models/Keyword");
const Country = require("../models/Country");
const State = require("../models/State");
const City = require("../models/City");


/* =========================================================
   UPDATE KEYWORD IN CITY
   Only updates the single global content record
========================================================= */

const updateKeywordInCity = async (req, res) => {
    try {
        const {
            name,
            shortDescription,
            description,
            extraDescription,
            metaTitle,
            metaDescription,
            metaKeywords,
        } = req.body;

        let keywordInCity =
            await KeywordInCity.findOne();

        if (!keywordInCity) {
            return res.status(404).json({
                message: "No Keyword in City record found to update",
            });
        }

        keywordInCity.name =
            name?.trim() || "";

        keywordInCity.shortDescription =
            shortDescription?.trim() || "";

        keywordInCity.description =
            description?.trim() || "";

        keywordInCity.extraDescription =
            extraDescription?.trim() || "";

        keywordInCity.metaTitle =
            metaTitle?.trim() || "";

        keywordInCity.metaDescription =
            metaDescription?.trim() || "";

        keywordInCity.metaKeywords =
            metaKeywords?.trim() || "";

        const updatedKeywordInCity =
            await keywordInCity.save();

        return res.status(200).json({
            message:
                "Keyword in city content updated successfully",
            keywordInCity: updatedKeywordInCity,
        });
    } catch (error) {
        console.error(
            "Error while updating Keyword in City:",
            error
        );

        return res.status(500).json({
            message: "Server error",
        });
    }
};

/* =========================================================
   GET KEYWORD IN CITY
   Returns the single global content record
========================================================= */

const getKeywordInCity = async (req, res) => {
    try {
        const keywordInCity =
            await KeywordInCity.findOne();

        // if (!keywordInCity) {
        //     return res.status(404).json({
        //         message:
        //             "Keyword in city content not configured",
        //     });
        // }

        if (!keywordInCity) {
            keywordInCity = await KeywordInCity.create({
                name: "",
                shortDescription: "",
                description: "",
                extraDescription: "",
                metaTitle: "",
                metaDescription: "",
                metaKeywords: "",
            });
        }

        return res.status(200).json({
            message: "Data fetched successfully",
            keywordInCity,
        });
    } catch (error) {
        console.error(
            "Unable to fetch Keyword in City:",
            error
        );

        return res.status(500).json({
            message: "Server error",
        });
    }
};


/* =========================================================
   FRONTEND
========================================================= */

const keywordInCityFrontend = async (req, res) => {
    try {
        const {
            locationSlug,
            productSlug,
        } = req.params;

        if (!locationSlug) {
            return res.status(400).json({
                message: "Location slug is required",
            });
        }

        if (!productSlug) {
            return res.status(400).json({
                message: "Keyword slug is required",
            });
        }


        /* =====================================================
           GET KEYWORD IN CITY CONTENT
        ===================================================== */

        const doc =
            await KeywordInCity.findOne().select(
                "-isActive -createdAt -updatedAt -__v"
            );

        if (!doc) {
            doc = await KeywordInCity.create({
                name: "",
                shortDescription: "",
                description: "",
                extraDescription: "",
                metaTitle: "",
                metaDescription: "",
                metaKeywords: "",
            });
        }


        /* =====================================================
           GET LOCATION
           Country -> State -> City
        ===================================================== */

        let locationData =
            await Country.findOne({
                slug: locationSlug,
                isActive: true,
            }).lean();

        let locationType = "country";

        if (!locationData) {
            locationData =
                await State.findOne({
                    slug: locationSlug,
                    isActive: true,
                }).lean();

            locationType = "state";
        }

        if (!locationData) {
            locationData =
                await City.findOne({
                    slug: locationSlug,
                    isActive: true,
                }).lean();

            locationType = "city";
        }

        if (!locationData) {
            return res.status(404).json({
                message: "Location doesn't exist",
            });
        }


        /* =====================================================
           GET KEYWORD
           Keyword is the dynamic main data
        ===================================================== */

        const keyword =
            await Keyword.findOne({
                slug: productSlug,
                isActive: true,
            }).lean();

        if (!keyword) {
            return res.status(404).json({
                message: "Keyword doesn't exist",
            });
        }


        /* =====================================================
           CONVERT CONTENT TO PLAIN OBJECT
        ===================================================== */

        const data = doc.toObject();


        /* =====================================================
           CONTENT REPLACEMENT
        ===================================================== */

        const replaceContent = (value) => {
            if (typeof value !== "string") {
                return value;
            }

            return value
                .replace(
                    /keyword/gi,
                    keyword.name
                )
                .replace(
                    /subdomain/gi,
                    locationData.name
                );
        };


        data.name =
            replaceContent(data.name);

        data.shortDescription =
            replaceContent(
                data.shortDescription
            );

        data.description =
            replaceContent(
                data.description
            );

        data.extraDescription =
            replaceContent(
                data.extraDescription
            );

        data.metaTitle =
            replaceContent(
                data.metaTitle
            );

        data.metaDescription =
            replaceContent(
                data.metaDescription
            );

        data.metaKeywords =
            replaceContent(
                data.metaKeywords
            );


        /* =====================================================
           KEYWORD MAIN DATA
        ===================================================== */

        // data.keyword = {
        //     _id: keyword._id,
        //     name: keyword.name,
        //     slug: keyword.slug,
        // };


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


        /* =====================================================
           LOCATION INFORMATION
        ===================================================== */

        // data.location = {
        //     _id: locationData._id,
        //     name: locationData.name,
        //     slug: locationData.slug,
        //     type: locationType,
        // };


        /* =====================================================
           RESPONSE
        ===================================================== */

        return res.status(200).json({
            message: "Data fetched successfully",
            data,
        });

    } catch (error) {
        console.error(
            "Keyword in city frontend error:",
            error
        );

        return res.status(500).json({
            message: "Server error",
        });
    }
};


module.exports = {
    updateKeywordInCity,
    getKeywordInCity,
    keywordInCityFrontend,
};