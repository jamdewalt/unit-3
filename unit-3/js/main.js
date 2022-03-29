//execute script when window is loaded
window.onload = function(){

    var w= 950, h=600;

    var container = d3.select("body")
        .append("svg")
        .attr("height",h)
        .attr("width",w)
        .attr("call", "container") //get the <body> element from the DOM
        .style("background-color","rgba(0,0,0,0.2");

     //below Example 3.9...create a text element and add the title
    var title = container.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("x", 450)
        .attr("y", 30)
        .text("City Populations");

    var innerRect = container.append("rect")
        .datum(400) //one data value
        .attr("height",function(d){
            return d;
        })
        .attr("width",function(d){
            return d * 2;
        })
        .attr("x",50)
        .attr("y",50)
        .style("fill","white");
    
    var cityPop = [
        { 
            city: 'Madison',
            population: 233209
        },
        {
            city: 'Milwaukee',
            population: 594833
        },
        {
            city: 'Green Bay',
            population: 104057
        },
        {
            city: 'Superior',
            population: 27244
        }
    ]; //all data needs to be in array format. 

    //scale must be defined before use
    var x = d3.scaleLinear() //create the scale
        .range([90, 810]) //output min and max
        .domain([0, 3.3]); //input min and max

    //find the minimum value of the array
    var minPop = d3.min(cityPop, function(d){
        return d.population;
    });

    //find the maximum value of the array
    var maxPop = d3.max(cityPop, function(d){
        return d.population;
    });

    //scale for circles center y coordinate
    var y = d3.scaleLinear()
        .range([450, 50]) //bottom to the top
        .domain([0, 700000]); // adjusted to fit data better


    //color scale generator 
    var color = d3.scaleLinear()
        .range([
            "#FDBE85",
            "#D94701"
        ])
        .domain([
            minPop, 
            maxPop
        ]);

    var circles = container.selectAll(".circles") //create an empty selection. MUST match the attribute function!
        .data(cityPop) //here we feed in an array
        .enter() //one of the great mysteries of the universe
        .append("circle") //inspect the HTML--holy crap, there's some circles there
        .attr("class", "circles") // 
        .attr("id", function(d){
            return d.city;
        })
        .attr("r", function(d){
            //calculate the radius based on population value as circle area
            var area = d.population * 0.01;
            return Math.sqrt(area/Math.PI); 
        })
        .attr("cx", function(d, i){
            //use the index to place each circle horizontally
            return x(i);
        })
        .attr("cy", function(d){
            //subtract value from 450 to "grow" circles up from the bottom instead of down from the top of the SVG
            return y(d.population);
        })
        .style("fill",function(d){
            return color(d.population);
        });

    //Example 3.14 line 1...create circle labels
    var labels = container.selectAll(".labels")
        .data(cityPop)
        .enter()
        .append("text")
        .attr("class", "labels")
        .attr("text-anchor", "left")
        .attr("y", function(d){
            //vertical position centered on each circle
            return y(d.population) + 0; // changed to center better
        });

    //first line of label
    var nameLine = labels.append("tspan")
        .attr("class", "nameLine")
        .attr("x", function(d,i){
            //horizontal position to the right of each circle
            return x(i) + Math.sqrt(d.population * 0.01 / Math.PI) + 5;
        })
        .text(function(d){
            return d.city;
        });
    
     //create format generator
    var format = d3.format(",");

    //Example 3.16 line 1...second line of label
    var popLine = labels.append("tspan")
        .attr("class", "popLine")
        .attr("x", function(d,i){
            return x(i) + Math.sqrt(d.population * 0.01 / Math.PI) + 5;
        })
        .attr("dy", "15") //vertical offset
        .text(function(d){
            return "Pop. " + format(d.population); //use format generator to format numbers
        });

        //Example 3.6 line 1...create y axis generator
        var yAxis = d3.axisLeft(y);


    //Example 3.8 line 1...create axis g element and add axis
    var axis = container.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(50, 0)")
        .call(yAxis);

};