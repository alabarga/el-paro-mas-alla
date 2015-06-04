var Lines = function(session){

  var margin = {top: 80, right: 140, bottom: 70, left: 60},
    width = 950 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

  var parseDate = d3.time.format("%Y").parse;

  var x = d3.time.scale()
      .range([0, width]);

  var y = d3.scale.linear()
      .range([height, 0]);

  var color = d3.scale.ordinal()
              .range(["#BD2D28", "#E3BA22", "#708259", "#E6842A", "#137B80", "#8E6C8A", "#b9c1ab"])
              .domain(["parados", "inactivos", "ocupados", "activos", "asalariados", "c_propia", "asal_temp", "asal_temp_parc", "asal_temp_parc_inv", "asal_temp_comp", "asal_indef", "asal_indef_parc", "asal_indef_parc_inv", "asal_indef_comp", "para_b_4mas_a", "para_b_2a4a", "para_b_1a2a", "para_b_6ma1a", "para_b_menos6m", "inac_desanim"]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .tickSubdivide(0)
      .tickSize(0-width);

  var line = d3.svg.line()
      .interpolate("basis")
      .x(function(d) { return x(d.year); })
      .y(function(d) { return y(d.porcentaje); });

  var svgLines = d3.select('#line_chart').append('svg')
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var line_charts = {
    ocupados:   ["ocupados", "asal_indef", "asal_temp", "asal_temp_parc", "asal_temp_parc_inv", "asal_temp_comp", "asal_indef_parc", "asal_indef_parc_inv", "asal_indef_comp"],
    parados:    ["parados", "para_b_4mas_a", "para_b_2a4a", "para_b_1a2a", "para_b_6ma1a", "para_b_menos6m"],
    inactivos:  ["inactivos", "inac_desanim", "inactivos"],
  };

  d3.csv("assets/data/df_per.csv", function(error, rawData) {

    // Format the data
    rawData.forEach(function(d) {
      d.year = parseDate(d.year);
      d.porcentaje = +d.porcentaje;
      d.count = +d.count;
    });
    
    var situations = d3.set(rawData.map(function(d) { return d.situation; })).values();

    // Set up the domains
    x.domain(d3.extent(rawData, function(d) { return d.year; }));
    y.domain([0, 1]);
   

    data = rawData
              .filter(function(d) { return d.edad == session.get('age'); })
              .filter(function(d) { return d.sexo == session.get('sex'); })
              .filter(function(d) { return d.situation != "total"; });

    data.sort(function(a,b){
      return a.year - b.year
    });

    
    var data_ccaa = data
                      .filter(function(d) { return d.codigo == session.get('autonomousRegion'); });

    var nested_data_ccaa = d3.nest()
                        .key(function(d) { return d.situation; })
                        .entries(data_ccaa);
    var data_esp = data
                    .filter(function(d) { return d.codigo === "0"; });

    var nested_data_esp = d3.nest()
                        .key(function(d) { return d.situation; })
                        .entries(data_esp);


    // Draw the axis  
    svgLines.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height + 5) + ")")
        .call(xAxis);

    svgLines.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("class", "yTitle")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "-3em")
        .style("text-anchor", "end")
        .style("fill", "black")
        .text("%"); 

  console.log(color.range())
  console.log(color.domain())

  // Draw the lines 
  var lines_ccaa = svgLines.selectAll(".lines.ccaa")
      .data(nested_data_ccaa)
    .enter().append("g")
      .attr("class", "lines ccaa");


  lines_ccaa.append("path")
      .attr("class", "line ccaa")
      .attr("id", function(d){ return d.key;})
      .attr("d", function(d) { return line(d.values); })
      .style('fill', 'none')
      .style("opacity", function(d) {
        if (d.key === "parados" || d.key === "ocupados" || d.key === "inactivos") {
          return 1;
        } else {
          return 0;
        }
       })
      .style("stroke", function(d) { return d3.rgb(color(d.key)).darker(.5); })
      .style("stroke-width", function(d) {return d.key !== "ocupados" ? 2 : 3});

  var lines_esp = svgLines.selectAll(".lines.esp")
      .data(nested_data_esp)
    .enter().append("g")
      .attr("class", "lines esp");

  lines_esp.append("path")
      .attr("class", "line esp")
      .attr("id", function(d){ return d.key;})
      .attr("d", function(d) { return line(d.values); })
      .style('fill', 'none')
      .style("opacity", function(d) {
        if (d.key === "parados" || d.key === "ocupados" || d.key === "inactivos") {
          return 1;
        } else {
          return 0;
        }
       })
      .style("stroke", function(d) { return d3.rgb(color(d.key)).darker(.5); })
      .style("stroke-width", 2)
      .style("stroke-dasharray", ("8,8"));

  });
}