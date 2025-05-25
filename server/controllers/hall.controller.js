const Hall = require('../models/Hall');

exports.createHall = async (req, res) => {
  try {
    const { name, coordinates } = req.body;

    if (!name || !coordinates || !Array.isArray(coordinates) || coordinates.length === 0) {
      return res.status(400).json({ message: 'Name and coordinates (array) are required' });
    }

    const newHall = new Hall({
      name,
      coordinates
    });

    await newHall.save();

    res.status(201).json({ message: 'Hall created successfully', hall: newHall });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
