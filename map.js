w                                  w nk                                                                                                                                                                                                                                                                                                                         // make D3 aware of the <canvas> element in the HTML
var canvas = d3.select("canvas");

var ctx = canvas.node().getContext("2d");

// get <canvas> width and height from HTML instead of hard-coding values
var canvasWidth = +canvas.attr("width"),
  canvasHeight = +canvas.attr("height");

// define the map projection
// we're going from spherical latitude/longitude coordinates to a flat map
var projection = d3
  // use Mercator for now, sigh, because of web map ubiquity...
  .geoMercator()
  // shift the projection translation offset to half of the parent <canvas> width and height
  .translate([canvasWidth / 2, canvasHeight / 2])
  // [0, 0] is redundant, but you could change the initial center [longitude, latitude]
  .center([0, 0])
  // [0, 0, 0] is also redundant, but you can change the rotation along 3 axes
  // this property is really fun, so experiment with different values!
  .rotate([0, 0, 0])
  // set an initial scale value
  .scale(canvasWidth / (2 * Math.PI));

// NOTE: if you want to skip setting the translate and scale values
// and instead zoom out to the whole world, you can just use this shortcut:
// projection.fitSize([canvasWidth, canvasHeight], {
//   type: "Sphere"
// });

// "d3.geoPath" helps convert from geojson coordinates to <svg> or <canvas> drawing instructions
// it needs to know about the projection that was defined above
// and the <canvas> 2d rendering context

// I like to refer to it as a "geographic path generator" throughout the code
var geoPathGenerator = d3
  .geoPath()
  .projection(projection)
  .context(ctx);

// request publicly available and hosted world topojson data,
// convert it to geojson,
// and then draw it in the <canvas>
d3
  .json("https://unpkg.com/world-atlas@1.1.4/world/50m.json")
  .then(function(loadedTopoJson) {
    // use the concept of a topojson "mesh" to convert topojson
    // to a single, efficient geojson geometry
    var geoJson = topojson.mesh(
      loadedTopoJson,
      loadedTopoJson.objects.countries
    );

    // and then draw the single geojson representing all country polygons
    // by giving explicit instructions to the <canvas> 2d rendering context
    ctx.beginPath();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    geoPathGenerator(geoJson);
    ctx.stroke();
  });
