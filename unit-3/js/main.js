//This program creates a county map of AZ and includes data from Mexico/US to set the scene. 
//begin script when window loads
window.onload = setMap();

//Example 1.3 line 4...set up choropleth map
function setMap() {
    //map frame dimensions
    var width = 960,
        height = 460;
    
    
    //create new svg container for the map
    var map = d3
        .select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height)



    //creates Mercator projection centered on AZ. Not sure if this is okay or not
    var projection = d3.geoTransverseMercator()
        .rotate([111 + 55 / 60, -33])
        .scale(2100)
        .translate([width / 2, height / 2]);

    var path = d3.geoPath().projection(projection);

    //use Promise.all to parallelize asynchronous data loading
    var promises = [
        d3.csv("data/unitsData.csv"),
        d3.json("data/AmericanStates.topojson"),
        d3.json("data/MexicoTerritory.topojson"),
        d3.json("data/ArizonaRegions.topojson"),
    ];
    Promise.all(promises).then(callback);

    function callback(data) {
        var csvData = data[0],
            american = data[1],
            mexico = data[2],
            arizona = data[3];
            //console.log(csvData);
            console.log(american);
            //console.log(arizona);

        
        //translate to US TopoJSON
        var americanStates = topojson.feature(american, american.objects.AmericanStates),
            mexicoTerritory = topojson.feature(mexico, mexico.objects.MexicoTerritory),
            arizonaRegions = topojson.feature(arizona, arizona.objects.ArizonaRegions).features;
              //examine the results
        console.log(americanStates);
        //console.log(arizonaRegions);
    

        var graticule = d3.geoGraticule().step([5, 5]); //place graticule lines every 5 degrees of longitude and latitude

        //create graticule background
        var gratBackground = map
            .append("path")
            .datum(graticule.outline()) //bind graticule background
            .attr("class", "gratBackground") //assign class for styling
            .attr("d", path); //project graticule

        //create graticule lines
        var gratLines = map
            .selectAll(".gratLines") //select graticule elements that will be created
            .data(graticule.lines()) //bind graticule lines to each element to be created
            .enter() //create an element for each datum
            .append("path") //append each element to the svg as a path element
            .attr("class", "gratLines") //assign class for styling
            .attr("d", path) //project graticule lines
            
            

        //add US states to map. 
        var states = map.append("path")
            .datum(americanStates)
            .attr("class", "states")
            .attr("d", path);
        
        var territory = map.append("path")
        .datum(mexicoTerritory)
        .attr("class", "territory")
        .attr("d", path);

        //add AZ counties to map
        var regions = map.selectAll(".regions")
            .data(arizonaRegions)
            .enter()
            .append("path")
            .attr("class", function (d) {
                return "regions " + d.properties.adm1_code;
            })
            .attr("d", path);
    }
    
}