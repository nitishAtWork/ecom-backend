
const Keyword = require("../models/Keyword");
const NatureOfBusiness = require("../models/NatureOfBusiness");
const Country = require("../models/Country");
const State = require("../models/State");
const City = require("../models/City");

// Helper: validate and normalize a slug
const isValidSlug = (slug) =>
    typeof slug === "string" && slug.trim().length > 0;

// GET: All slugs with their types
const getAllSlug = async (req, res) => {
    try {
        const [
            keywords,
            countries,
            states,
            cities,
            businesses,
        ] = await Promise.all([
            Keyword.find({ isActive: true }).select("slug").lean(),
            Country.find({ isActive: true }).select("slug").lean(),
            State.find({ isActive: true }).select("slug").lean(),
            City.find({ isActive: true }).select("slug").lean(),
            NatureOfBusiness.find({ isActive: true }).select("slug").lean(),
        ]);

        const toSlugItems = (items, type) =>
            items
                .filter((item) => isValidSlug(item.slug))
                .map((item) => ({
                    slug: item.slug.trim(),
                    type,
                }));

        const data = [
            ...toSlugItems(keywords, "keyword"),
            ...toSlugItems(countries, "country"),
            ...toSlugItems(states, "state"),
            ...toSlugItems(cities, "city"),
            ...toSlugItems(businesses, "natureOfBusiness"),
        ];

        return res.status(200).json({
            success: true,
            total: data.length,
            data,
            message: "All Slugs Fetched",
        });
    } catch (error) {
        console.error("Error fetching slugs:", error);

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// GET: All individual and combined slugs for sitemap
const getAllSlugSitemap = async (req, res) => {
    try {
        const [
            keywords,
            countries,
            states,
            cities,
            businesses,
        ] = await Promise.all([
            Keyword.find({ isActive: true }).select("slug").lean(),
            Country.find({ isActive: true }).select("slug").lean(),
            State.find({ isActive: true }).select("slug").lean(),
            City.find({ isActive: true }).select("slug").lean(),
            NatureOfBusiness.find({ isActive: true }).select("slug").lean(),
        ]);

        const slugSet = new Set();

        // Add individual slugs
        const collections = [
            keywords,
            countries,
            states,
            cities,
            businesses,
        ];

        for (const collection of collections) {
            for (const item of collection) {
                if (isValidSlug(item.slug)) {
                    slugSet.add(item.slug.trim());
                }
            }
        }

        // Helper: generate location/keyword combinations
        const addKeywordCombinations = (locations) => {
            for (const location of locations) {
                if (!isValidSlug(location.slug)) continue;

                for (const keyword of keywords) {
                    if (!isValidSlug(keyword.slug)) continue;

                    slugSet.add(
                        `${location.slug.trim()}/${keyword.slug.trim()}`
                    );
                }
            }
        };

        // country/keyword
        addKeywordCombinations(countries);

        // state/keyword
        addKeywordCombinations(states);

        // city/keyword
        addKeywordCombinations(cities);

        // natureOfBusiness/keyword
        addKeywordCombinations(businesses);

        const data = [...slugSet].map((slug) => ({ slug }));

        return res.status(200).json({
            success: true,
            total: data.length,
            data,
            message: "All Slugs Fetched",
        });
    } catch (error) {
        console.error("Error fetching sitemap slugs:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch slugs.",
        });
    }
};

module.exports = {
    getAllSlug,
    getAllSlugSitemap,
};
