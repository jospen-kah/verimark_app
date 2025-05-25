const pointInPolygon = require('point-in-polygon'); // or implement your own

exports.isInsidePolygonWithAltitude = (point, polygon) => {
  const flatPolygon = polygon.map(p => [p.latitude, p.longitude]);
  const in2D = pointInPolygon([point.latitude, point.longitude], flatPolygon);

  if (!in2D) return false;

  const altitudes = polygon.map(p => p.altitude);
  const minAlt = Math.min(...altitudes);
  const maxAlt = Math.max(...altitudes);

  return point.altitude >= minAlt && point.altitude <= maxAlt;
};
