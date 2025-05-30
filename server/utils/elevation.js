const axios = require('axios');

exports.getElevation = async (latitude, longitude) => {
  try {
    const response = await axios.get('https://api.opentopodata.org/v1/srtm90m', {
      params: {
        locations: `${latitude},${longitude}`
      }
    });

    if (response.data && response.data.results && response.data.results.length > 0) {
      return response.data.results[0].elevation;
    } else {
      throw new Error('Elevation not found');
    }
  } catch (err) {
    console.error('Elevation API error:', err.message);
    throw new Error('Failed to fetch elevation');
  }
};
