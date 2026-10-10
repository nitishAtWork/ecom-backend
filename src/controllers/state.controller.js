const State = require("../models/State");
const slug = require("slugify");

// Create State
const createState = async (req, res) => {
  try {
    const { name, countryId, slug: customSlug, isActive } = req.body;

    // Check if state name already exists (case-insensitive)
    const existingState = await State.findOne({
      name: { $regex: `^${name.trim()}$`, $options: "i" },
    });

    if (existingState) {
      return res.status(400).json({ message: "State name already exists" });
    }

    // Generate slug if not provided
    const generatedSlug = slug(name, { lower: true });

    // Create state
    const newState = await State.create({
      name,
      countryId: countryId || null,
      slug: customSlug || generatedSlug,
      isActive,
    });
    res.status(201).json({
      message: "State created successfully",
      state: newState,
    });
  } catch (error) {
    console.error("Create state error:", error);
    res.status(500).json({ message: "Server error, can't create state" });
  }
};

// Update State
const updateState = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, countryId, slug: customSlug } = req.body;

    // Find state by ID
    const state = await State.findById(id);
    if (!state) {
      return res.status(404).json({ message: "State not found" });
    }
    // Update state fields
    state.name = name;
    state.countryId = countryId || null;
    state.slug = customSlug || slug(name, { lower: true });
    
    const updatedState = await state.save();
    res.status(200).json({
      message: "State updated successfully",
      state: updatedState,
    });
  } catch (error) {
    console.error("Update state error:", error);
    res.status(500).json({ message: "Server error, can't update state" });
  }
};

// Delete State
const deleteState = async (req, res) => {
  try {
    const { id } = req.params;

    // Find state by ID
    const state = await State.findById(id);
    if (!state) {
      return res.status(404).json({ message: "State not found" });
    }
    // Delete state
    await State.findByIdAndDelete(id);
    res.status(200).json({ message: "State deleted successfully" });
  } catch (error) {
    console.error("Delete state error:", error);
    res.status(500).json({ message: "Server error, can't delete state" });
  }
};

// Toggle State Active Status
const toggleStateStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Find state by ID
    const state = await State.findById(id);
    if (!state) {
      return res.status(404).json({ message: "State not found" });
    }
    // Toggle active status
    state.isActive = !state.isActive;
    await state.save();
    res.status(200).json({
      message: "State status updated successfully",
      isActive: state.isActive,
    });
  } catch (error) {
    console.error("Toggle state status error:", error);
    res
      .status(500)
      .json({ message: "Server error, can't toggle state status" });
  }
};


// Get Single State
const getSingleState = async (req, res) => {
    try {
        const { id } = req.params;
    
        // Find state by ID
        const state = await State.findById(id);
        if (!state) {
            return res.status(404).json({ message: "State not found" });
        }
        res.status(200).json({ state });
    } catch (error) {
        console.error("Get single state error:", error);
        res.status(500).json({ message: "Server error, can't get state" });
    }
}

// Get All States
const getAllStates = async (req, res) => {
  try {
    const states = await State.find();
    res.status(200).json({ states });
  } catch (error) {
    console.error("Get all states error:", error);
    res.status(500).json({ message: "Server error, can't get states" });
  }
}

// Get All Active States for Frontend
const getAllActiveStates = async (req, res) => {
  try {
    const states = await State.find({ isActive: true });
    res.status(200).json({  data: states });
  } catch (error) {
    console.error("Get all active states error:", error);
    res.status(500).json({ message: "Server error, can't get active states" });
  }
};

module.exports = {
    createState,
    updateState,
    deleteState,
    toggleStateStatus,
    getSingleState,
    getAllStates,
    getAllActiveStates
}
