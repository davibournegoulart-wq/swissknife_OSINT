const countryCoords = require('./src/data/country_coords.json');
Object.entries(countryCoords).forEach(([country, coords]) => {
  if (coords.lat === undefined || coords.lng === undefined) {
    console.log("BAD COORDS:", country, coords);
  }
});
console.log("DONE");
