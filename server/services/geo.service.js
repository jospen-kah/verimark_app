const pointInPolygon = require('point-in-polygon');

exports.isInsidePolygonWithAltitude = (point, polygonCoords, minAlt, maxAlt, buffer = 1) => {
  const flatPolygon = polygonCoords.map(p => [p.latitude, p.longitude]);
  const in2D = pointInPolygon([point.latitude, point.longitude], flatPolygon);
    console.log(`Point ${point.latitude}, ${point.longitude} with altitude ${point.altitude} is inside polygon: ${in2D}`);


  if (!in2D) return false;

  // Altitude check with optional buffer (e.g., ±1m)
  return point.altitude >= (minAlt - buffer) && point.altitude <= (maxAlt + buffer);
  
};
