const Country = require("../models/Country");
const slug = require("slugify");

// Create Country
const createCountry = async (req, res) => {
  try {
    const { name, slug: customSlug, isActive } = req.body;

    // Check if country name already exists (case-insensitive)
    const existingCountry = await Country.findOne({
      name: { $regex: `^${name.trim()}$`, $options: "i" },
    });

    if (existingCountry) {
      return res.status(400).json({ message: "Country name already exists" });
    }

    // Generate slug if not provided
    const generatedSlug = slug(name, { lower: true });

    // Create country
    const newCountry = await Country.create({
      name,
      slug: customSlug || generatedSlug,
      isActive,
    });

    res.status(201).json({
      message: "Country created successfully",
      country: newCountry,
    });
  } catch (error) {
    console.error("Create country error:", error);
    res.status(500).json({ message: "Server error, can't create country" });
  }
};

// Update Country
const updateCountry = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug: customSlug } = req.body;

    // Find country by ID
    const country = await Country.findById(id);
    if (!country) {
      return res.status(404).json({ message: "Country not found" });
    }

    // Update country fields
    country.name = name;
    country.slug = customSlug || slug(name, { lower: true });

    const updatedCountry = await country.save();

    res.status(200).json({
      message: "Country updated successfully",
      country: updatedCountry,
    });
  } catch (error) {
    console.error("Update country error:", error);
    res.status(500).json({ message: "Server error, can't update country" });
  }
};

// Delete Country
const deleteCountry = async (req, res) => {
  try {
    const { id } = req.params;

    // Find country by ID
    const country = await Country.findById(id);

    if (!country) {
      return res.status(404).json({ message: "Country not found" });
    }

    // Delete country
    await Country.findByIdAndDelete(id);

    res.status(200).json({ message: "Country deleted successfully" });
  } catch (error) {
    console.error("Delete country error:", error);
    res.status(500).json({ message: "Server error, can't delete country" });
  }
};

// Toggle Country Status
const toggleCountryStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Find country by ID
    const country = await Country.findById(id);
    if (!country) {
      return res.status(404).json({ message: "Country not found" });
    }
    // Toggle active status
    country.isActive = !country.isActive;
    await country.save();
    res.status(200).json({
      message: "Country status updated successfully",
      isActive: country.isActive,
    });
  } catch (error) {
    console.error("Toggle country status error:", error);
    res
      .status(500)
      .json({ message: "Server error, can't toggle country status" });
  }
};

// Get Single Country
const getSingleCountry = async (req, res) => {
  try {
    const { id } = req.params;
    const country = await Country.findById(id);
    if (!country) {
      return res.status(404).json({ message: "Country not found" });
    }
    res.status(200).json({ country });
  } catch (error) {
    console.error("Get single country error:", error);
    res.status(500).json({ message: "Server error, can't get country" });
  }
};

// Get All Countries
const getAllCountries = async (req, res) => {
  try {
    const countries = await Country.find();
    res.status(200).json({ countries });
  } catch (error) {
    console.error("Get all countries error:", error);
    res.status(500).json({ message: "Server error, can't get countries" });
  }
};

// Get All Active Countries for Frontend
const getAllActiveCountriesFront = async (req, res) => {
  try {
    const countries = await Country.find({ isActive: true });
    res.status(200).json({ data: countries });
  } catch (error) {
    console.error("Get all active countries error:", error);
    res
      .status(500)
      .json({ message: "Server error, can't get active countries" });
  }
};


module.exports = {
  createCountry,
  updateCountry,
  deleteCountry,
  toggleCountryStatus,
  getSingleCountry,
  getAllCountries,
  getAllActiveCountriesFront,
};