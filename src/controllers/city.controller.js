const City = require("../models/City");
const slug = require("slugify");

// Create City
const createCity = async (req, res) => {
    try {

        const { name, countryId, stateId, isActive, majorcity } = req.body;

        // Check if city name already exists (case-insensitive)
        const existingCity = await City.findOne({
            name: { $regex: `^${name.trim()}$`, $options: "i" },
        });
        if (existingCity) {
            return res.status(400).json({ message: "City name already exists" });
        }

        // Generate slug if not provided
        const generatedSlug = slug(name, {
            lower: true,
            strict: true,
        });

        // Create city
        const newCity = await City.create({
            name: name.trim(),
            countryId: countryId || null,
            stateId: stateId || null,
            slug: generatedSlug,
            majorcity,
            isActive,
        });

        res.status(201).json({
            message: "City created successfully",
            city: newCity,
        })

    } catch (error) {
        console.error("Create city error:", error);
        res.status(500).json({ message: "Server error, can't create city" });
    }
}

// Update City
const updateCity = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, countryId, stateId, majorcity, isActive } = req.body;

        // Find city by ID
        const city = await City.findById(id);
        if (!city) {
            return res.status(404).json({ message: "City not found" })
        }

        const nameChanged =
            city.name.trim().toLowerCase() !==
            name.trim().toLowerCase();

        // Update city fields
        city.name = name.trim();
        city.countryId = countryId || null;
        city.stateId = stateId || null;
        city.majorcity = majorcity;
        city.isActive = isActive;


        if (nameChanged) {
            city.slug = slug(name, {
                lower: true,
                strict: true,
            });
        }

        const updatedCity = await city.save();

        res.status(200).json({
            message: "City updated successfully",
            city: updatedCity,
        });

    } catch (error) {
        console.error("Update city error:", error);
        res.status(500).json({ message: "Server error, can't update city" });
    }
}

// Delete City
const deleteCity = async (req, res) => {
    try {
        const { id } = req.params;

        // Find city by ID
        const city = await City.findById(id);
        if (!city) {
            return res.status(404).json({ message: "City not found" });
        }

        // Delete city
        await City.findByIdAndDelete(id);

        res.status(200).json({ message: "City deleted successfully" });
    } catch (error) {
        console.error("Delete city error:", error);
        res.status(500).json({ message: "Server error, can't delete city" });
    }
};

// Toggle City Active Status
const toggleCityStatus = async (req, res) => {
    try {
        const { id } = req.params;

        // Find city by ID
        const city = await City.findById(id);
        if (!city) {
            return res.status(404).json({ message: "City not found" });
        }

        // Toggle active status
        city.isActive = !city.isActive;
        await city.save();

        res.status(200).json({
            message: "City status updated successfully",
            isActive: city.isActive,
        });
    } catch (error) {
        console.error("Toggle city status error:", error);
        res.status(500).json({ message: "Server error, can't toggle city status" });
    }
}

// Get Single City
const getSingleCity = async (req, res) => {
    try {
        const { id } = req.params;

        // Find city by ID
        const city = await City.findById(id);
        if (!city) {
            return res.status(404).json({ message: "City not found" });
        }

        res.status(200).json({ city });
    } catch (error) {
        console.error("Get single city error:", error);
        res.status(500).json({ message: "Server error, can't get city" });
    }
}

// Get All Cities
const getAllCities = async (req, res) => {
    try {
        const cities = await City.find();
        res.status(200).json({ cities });
    } catch (error) {
        console.error("Get all cities error:", error);
        res.status(500).json({ message: "Server error, can't get cities" });
    }
}

// Get All Active Cities for Frontend
const getAllActiveCities = async (req, res) => {
    try {
        const cities = await City.find({ isActive: true }).select("-__v -createdAt -updatedAt");
        res.status(200).json({ data: cities });
    } catch (error) {
        console.error("Get all active cities error:", error);
        res.status(500).json({ message: "Server error, can't get active cities" });
    }
}

module.exports = {
    createCity,
    updateCity,
    deleteCity,
    toggleCityStatus,
    getSingleCity,
    getAllCities,
    getAllActiveCities
};