//fill
(function (){

	//pseudo-global variables
	var attrArray = ["Murder", "Rape", "Robbery", "AggravatedAssault", "Burglary","LarcenyTheft","MotorVehicleTheft","Arson","HumanTrafficking"]; //list of attributes
	var expressed = attrArray[0]; //initial attribute


	//begin script when window loads
	window.onload = setMap();

	//Example 1.3 line 4...set up choropleth map
	function setMap(){

	    //map frame dimensions
    	var width = window.innerWidth * 0.5,
        height = 460;

	    //create new svg container for the map
	    var map = d3.select("body")
	        .append("svg")
	        .attr("class", "map")
	        .attr("width", width)
	        .attr("height", height);

        //creates Mercator projection centered on AZ. Not sure if this is okay or not
        var projection = d3.geoTransverseMercator()
            .rotate([111 + 55 / 60, -33])
            .scale(2100)
            .translate([width / 2, height / 2]);

	    var path = d3.geoPath().projection(projection);

	    //use Promise.all to parallelize asynchronous data loading
	    var promises = [d3.csv("data/unitsData.csv"),
        d3.json("data/AmericanStates.topojson"),
        d3.json("data/MexicoTerritory.topojson"),
        d3.json("data/ArizonaRegions.topojson"),
    ];
	    Promise.all(promises).then(callback);

	    function callback(data){
			var csvData = data[0],
            american = data[1],
            mexico = data[2],
            arizona = data[3];
	        setGraticule(map,path);

	        //translate to US TopoJSON
            var americanStates = topojson.feature(american, american.objects.AmericanStates),
                mexicoTerritory = topojson.feature(mexico, mexico.objects.MexicoTerritory),
                arizonaRegions = topojson.feature(arizona, arizona.objects.ArizonaRegions).features;
                //variables for data join

	         //add US states to map. 
            var states = map.append("path")
                .datum(americanStates)
                .attr("class", "states")
                .attr("d", path);
            
            //add mex territory to map
             var territory = map.append("path")
                .datum(mexicoTerritory)
                .attr("class", "territory")
                 .attr("d", path);

	        arizonaRegions = joinData(arizonaRegions, csvData);
           
	        var colorScale = makeColorScale(csvData);

	        setEnumerationUnits(arizonaRegions,map,path,colorScale);

	        //add coordinated visualization to the map
        	setChart(csvData, colorScale);

	    };

	    
	};

	function setGraticule(map,path){
		var graticule = d3.geoGraticule()
	            .step([5, 5]); //place graticule lines every 5 degrees of longitude and latitude

	        //create graticule background
	        var gratBackground = map.append("path")
	            .datum(graticule.outline()) //bind graticule background
	            .attr("class", "gratBackground") //assign class for styling
	            .attr("d", path) //project graticule

	        //create graticule lines
	        var gratLines = map.selectAll(".gratLines") //select graticule elements that will be created
	            .data(graticule.lines()) //bind graticule lines to each element to be created
	            .enter() //create an element for each datum
	            .append("path") //append each element to the svg as a path element
	            .attr("class", "gratLines") //assign class for styling
	            .attr("d", path); //project graticule lines
	}

	function joinData(arizonaRegions,csvData){
		//loop through csv to assign each set of csv attribute values to geojson region
	        for (var i=0; i<csvData.length; i++){
	            var csvRegion = csvData[i]; //the current region
	            var csvKey = parseFloat(csvRegion.geoid);//the CSV primary key
                
                console.log(csvKey);

	            //loop through geojson regions to find correct region
	            for (var a=0; a<arizonaRegions.length; a++){

	                var geojsonProps = arizonaRegions[a].properties; //the current region geojson properties
	                var geojsonKey = geojsonProps.geoid; //the geojson primary key
                    console.log(geojsonKey);

	                //where primary keys match, transfer csv data to geojson properties object
	                if (geojsonKey == csvKey){

	                    //assign all attributes and values
	                    attrArray.forEach(function(attr){
	                        var val = parseFloat(csvRegion[attr]); //get csv attribute value
	                        geojsonProps[attr] = val; //assign attribute and value to geojson properties
	                    });
	                };
	            };
	        };
	        return arizonaRegions;
	}

	function makeColorScale(data){
		var colorClasses = [
	        "#fef0d9",
	        "#fdcc8a",
	        "#fc8d59",
	        "#e34a33",
	        "#b30000"
	    ];

	    //create color scale generator
	    var colorScale = d3.scaleQuantile()
	        .range(colorClasses);

	    //build array of all values of the expressed attribute
	    var domainArray = [];
	    for (var i=0; i<data.length; i++){
	        var val = parseFloat(data[i][expressed]);
	        domainArray.push(val);
	    };

	    //assign array of expressed values as scale domain
	    colorScale.domain(domainArray);

	    return colorScale;
	}

function setEnumerationUnits(arizonaRegions,map,path,colorScale){
	//add AZ regions to map
    var regions = map.selectAll(".regions")
        .data(arizonaRegions)
        .enter()
        .append("path")
        .attr("class", function(d){
            return "regions " + d.properties.geoid;
        })
        .attr("d", path)
        .style("fill", function(d){
            console.log(d.properties);
            
            var value = d.properties[expressed];
            if(value) {
            	return colorScale(d.properties[expressed]);
            } else {
            	return "#ccc";
            }
    });
}

//function to create coordinated bar chart
function setChart(csvData, colorScale){
    //chart frame dimensions
    var chartWidth = window.innerWidth * 0.425,
        chartHeight = 473,
        leftPadding = 25,
        rightPadding = 2,
        topBottomPadding = 5,
        chartInnerWidth = chartWidth - leftPadding - rightPadding,
        chartInnerHeight = chartHeight - topBottomPadding * 2,
        translate = "translate(" + leftPadding + "," + topBottomPadding + ")";
    

    //create a second svg element to hold the bar chart
    var chart = d3.select("body")
        .append("svg")
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .attr("class", "chart");

    //create a rectangle for chart background fill
    var chartBackground = chart.append("rect")
        .attr("class", "chartBackground")
        .attr("width", chartInnerWidth)
        .attr("height", chartInnerHeight)
        .attr("transform", translate);

    //create a scale to size bars proportionally to frame and for axis
    var yScale = d3.scaleLinear()
        .range([463, 0])
        .domain([0, 200]);

    //set bars for each province
    var bars = chart.selectAll(".bar")
        .data(csvData)
        .enter()
        .append("rect")
        .sort(function(a, b){
            return b[expressed]-a[expressed]
        })
        .attr("class", function(d){
            return "bar " + d.geoid;
        })
        .attr("width", chartInnerWidth / csvData.length - 1)
        .attr("x", function(d, i){
            return i * (chartInnerWidth / csvData.length) + leftPadding;
        })
        .attr("height", function(d, i){
            return 463 - yScale(parseFloat(d[expressed]));
        })
        .attr("y", function(d, i){
            return yScale(parseFloat(d[expressed])) + topBottomPadding;
        })
        .style("fill", function(d){
            return colorScale(d[expressed]);
        });

    //create a text element for the chart title
    var chartTitle = chart.append("text")
        .attr("x", 100)
        .attr("y", 40)
        .attr("class", "chartTitle")
        .text("Total number of " + expressed + " in each county");

    //create vertical axis generator
    var yAxis = d3.axisLeft()
        .scale(yScale);

    //place axis
    var axis = chart.append("g")
        .attr("class", "axis")
        .attr("transform", translate)
        .call(yAxis);

    //create frame for chart border
    var chartFrame = chart.append("rect")
        .attr("class", "chartFrame")
        .attr("width", chartInnerWidth)
        .attr("height", chartInnerHeight)
        .attr("transform", translate);


};

})();

 

