const Hall = require('../models/Hall');

exports.createHall = async (req, res) => {
  try {
    const { name, floor, coordinates, minAltitude, maxAltitude } = req.body;

    // Validate required fields
    if (
      !name ||
      !floor ||
      !coordinates ||
      !Array.isArray(coordinates) ||
      coordinates.length === 0 ||
      typeof minAltitude !== 'number' ||
      typeof maxAltitude !== 'number'
    ) {
      return res.status(400).json({
        message: 'Name, floor, coordinates (array), minAltitude, and maxAltitude are required and must be valid.'
      });
    }

    // Optional: Validate altitude logic
    if (minAltitude >= maxAltitude) {
      return res.status(400).json({
        message: 'minAltitude must be less than maxAltitude.'
      });
    }

    const newHall = new Hall({
      name,
      floor,
      coordinates,
      minAltitude,
      maxAltitude
    });

    await newHall.save();

    res.status(201).json({ message: 'Hall created successfully', hall: newHall });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all halls
exports.getAllHalls = async (req, res) => {
  try {
    const halls = await Hall.find();
    res.status(200).json(halls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
