$(window).keydown(function(event) 
{
    if((event.keyCode == 107 && event.ctrlKey == true) || (event.keyCode == 109 && event.ctrlKey == true))
    {
        event.preventDefault(); 
    }

    $(window).bind('mousewheel DOMMouseScroll', function(event) 
    {
        if(event.ctrlKey == true)
        {
            event.preventDefault(); 
        }
    });
});
async function draw(){
    
    var height = 2000
    var width = 5000
    const initialScale = 1;

    var svg = d3.select("div#container")
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 5000 2000")
        .attr('transform', `scale(${initialScale})`)
        .classed("svg-content", true);
    var g = svg.append("g").attr("transform", "translate(" + width/2 + ", 200)")
    var g1 = svg.append("g").attr("transform", "translate(" + width/2 + ", 200)")
    var g2 = svg.append("g").attr("transform", "translate(" + width/2 + ", 200)")
    var g3 = svg.append("g").attr("transform", "translate(" + width/2 + ", 200)")

    var andGatePath = 'M -40 0 C -40 -50 -20 -60 0 -60 C 20 -60 40 -50 40 0 Z'
    var orGatePath = 'M -40 0 C -40 -30 -20 -60 0 -60 C 20 -60 40 -30 40 0 C 20 -12 -20 -12 -40 0'
    //var iePath = "M-" + width / 2 + " -" + height / 2 + " H" + width / 2 + " V" + height / 2 + " H-" + width / 2 + " Z";

    var legendWidth = 1000; // Adjust the width of the rectangle
    var legendHeight = 600; // Adjust the height of the rectangle

    var legendX = -1950 - legendWidth / 2; // Calculate the x-coordinate of the top-left corner
    var legendY = 1490 - legendHeight / 2; // Calculate the y-coordinate of the top-left corner


  
    function createLegend(g, legendX, legendY, legendInfo) {
        var legendGroup = g.append('g')
            .attr("class", 'legend')
            .attr("transform", "translate(" + legendX + "," + legendY + ")");
        
        // Add the background rectangle
        legendGroup.append('rect')
            .attr("width", legendInfo.width)
            .attr("height", legendInfo.height)
            .style('stroke', 'black')
            .style('stroke-width', 2)
            .style('fill', 'white');
        
        // Add the legend title
        legendGroup.append('text')
            .attr("transform", "translate(" + (legendInfo.titleX || 10) + "," + (legendInfo.titleY || 30) + ")")
            .text(legendInfo.title || 'Legend: ')
            .attr('font-size', '60')
            .attr('font-weight', 'bold');
        
        var allLegendTitles = legendInfo.items.map(function(item) {
                return item.title;
        });

        legendGroup.selectAll('legendLabels')
            .data(legendInfo.items)
            .enter()
            .append("text")
              .attr("x", 250)
              .attr("y", (d) => d.titleY)
              .text((d) => d.title)
              //.attr("text-anchor", "left")
              //.style("alignment-baseline", "middle")
              .attr('font-size', '50')
        // Add the legend items
        
        legendInfo.items.forEach(function(item) {
            if (item.type === 'rectangle') {
                legendGroup.append('rect')
                    .attr("transform", "translate(" + (item.x) + "," + (item.y) + ")")
                    .attr("width", item.width || 40)
                    .attr("height", item.height || 20)
                    .style('fill', item.fill || 'gray');
            } else if (item.type === 'path') {
                legendGroup.append('path')
                    .attr("transform", "translate(" + (item.x) + "," + (item.y) + ")")
                    .attr('d', item.d || '')
                    .attr('stroke', item.stroke || 'black')
                    .attr('stroke-width', item.strokeWidth || 2)
                    .style('fill', item.fill || 'gray');
            }
            
            
        });
    }
    
    // Define legend information
    var legendInfo = {
        width: 1100,
        height: 600,
        title: 'Legend:',
        titleX: 70,
        titleY: 100,
        itemX: 160,
        itemY: 220,
        items: [
            { type: 'rectangle', width: 100, height: 60, fill: '#92D050', x:100, y:400, title: 'Only true for Green Roofs', titleY:450},
            { type: 'rectangle', width: 100, height: 60, fill: '#B4C7E7', x:100, y:500, title: 'Only true for Bioswales or Rain Gardens', titleY:550},
            { type: 'path', d: orGatePath, stroke: 'black', strokeWidth: 2, fill: 'pink', x:150, y:220, title: 'OR Gate', titleY:220},
            { type: 'path', d: andGatePath, stroke: 'black', strokeWidth: 2, fill: 'yellow', x:150, y:330, title: 'AND Gate', titleY:330}
        ]
    };
   
    
    // Call the function to create the legend
    createLegend(g3, legendX, legendY, legendInfo);



    const tooltip = d3.select('#tooltip')

  

    var tree = d3.tree()
        .size([height, width - 160])
        .nodeSize([350,400])
        
    
    var stratify = d3.stratify()
        .parentId(function(d) { return d.id.substring(0, d.id.lastIndexOf(".")); });
    
    const descriptions = await d3.json('descriptions.json')

    //.log(descriptions.find(item => item.symbol === 'FM1'))
   // descriptions.find(item => item.symbol === nodeSymbol)
    
    async function faultTree(mode){
        // Data
        let fileName = mode + '.csv'
        
        const data = await d3.csv(fileName)
            
        var root = stratify(data)
            .sort(function(a, b) { return (a.height - b.height) || a.id.localeCompare(b.id); });


        var roots =  tree(root).links()
        
        
        roots.forEach(function(link) {
            
            var sourceId = link.source.id.substring(link.source.id.lastIndexOf(".") + 1);
            var fullId = link.target.id
            var targetId = link.target.id.substring(link.target.id.lastIndexOf(".") + 1);
            var nodeSymbol = link.target.data.symbol
            

            if (nodeSymbol.includes('SFF')) {
                if (nodeSymbol.includes('SFF1')) {
                    link.target.x = -350;
                    link.target.y = 400;
                } else if (nodeSymbol.includes('SFF2')) {
                    link.target.x = 0;
                    link.target.y = 400;
                } else if (nodeSymbol.includes('SFF3')) {
                    link.target.x = 350;
                    link.target.y = 400;
                }

            } 
            
            if (fullId.includes('.OR.AND')) {
                link.target.x = link.target.x;
                link.target.y = link.target.y ; // Set the desired y-coordinate value
            } else if (fullId.includes('.AND.OR')){
                link.target.x = link.target.x;
                link.target.y = link.target.y ; // Set the desired y-coordinate value
            } else if (targetId.includes('OR') || targetId.includes('AND')) {
                // Adjust the y-coordinate value for 'OR' and 'AND' nodes
                var labelLines = sourceId.split("\\n");
                if (labelLines.length === 1) {
                    var adjustY = 100
                } else if (labelLines.length === 2) {
                    var adjustY = 120
                } else if (labelLines.length === 3) {
                    var adjustY = 140
                } else if (labelLines.length === 4) {
                    var adjustY = 160
                }
                link.target.x = link.source.x;
                link.target.y = link.source.y + adjustY // Set the desired y-coordinate value based on number of lines in labels
            }


      
            
            
        });

        function elbow(d, i) {
            if (d.source.x === d.target.x) {
                // console.log('if')
                return "M" + d.source.x + "," + d.source.y
                + "V" + (d.target.y);
            } else {
                // console.log('went to else')
                return "M" + d.source.x + "," + d.source.y
                    + "V" + (d.target.y - 200) + "H" + d.target.x + "V" + (d.target.y);
            }  
          }
        
        var link = g.selectAll(".link")
            .data(roots)
                .join(
                (enter)=>enter.append("path")
                    .attr("class", "link")
                    .attr("d", elbow)
                    .style("stroke", "black")
                    .style("stroke-width", "4px"),
                (update) => update.attr("d", elbow),
                (exit)=>exit.remove()
                        )
        

        // Nodes
        var node = g.selectAll(".node")
        .data(root.descendants())
        .join(
        (enter)=>enter.append("g")
            .attr("class", function(d) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y  + ")"; }),
            
        (update) => update.attr("class", function(d) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y  + ")"; }),
            
        (exit)=>exit.remove()
                )
               

       // Function to determine the appropriate shape path based on node text
        function getShapeFill(d, nodeText){
            var nodeSymbol = d.data.symbol
            var nodeStyle = descriptions[nodeSymbol]
            

            if (nodeText.includes('OR')) {
                
                return "pink";

            } else if (nodeText.includes('AND')) {
                return "yellow";
            } else if (nodeStyle.fill) {
                return nodeStyle.fill;
            }
            else {
                return "white"
            }
        }

        function getShapeStroke(d, nodeText){
            var nodeSymbol = d.data.symbol
            var nodeStyle = descriptions[nodeSymbol]
            

            if (nodeText.includes('OR')) {
                
                return '3px';

            } else if (nodeText.includes('AND')) {
                return '3px';
            } else if (nodeStyle.strokewidth) {
                return nodeStyle.strokewidth;
            }
            else {
                return '3px'
            }
        }

        function getShapeDash(d, nodeText){
            var nodeSymbol = d.data.symbol
            var nodeStyle = descriptions[nodeSymbol]
            

            if (nodeText.includes('OR')) {
                
                return 'none';

            } else if (nodeText.includes('AND')) {
                return 'none';
            } else if (nodeStyle.strokedasharray) {
                return nodeStyle.strokedasharray;
            }
            else {
                return 'none'
            }
        }


        function getShapePath(d, nodeText) { //nodeText is the last part after .
            var nodeSymbol = d.data.symbol
            if (root.leaves().includes(d)) {
                if (nodeSymbol.includes('-triangle')){
                    var labelLines = nodeText.split("\\n");

                    var maxWidth = 0;
                    labelLines.forEach(function(line) {
                        var lineWidth = getLabelWidth(line);
                        maxWidth = Math.max(maxWidth, lineWidth);
                    });

                    var width = maxWidth + 50 ; // Adjust padding as needed
                    var height = 50 * labelLines.length;
                    return "M0 -" + height/1.7 + " L" + width/3 + " " + height/1.7 + " L-" + width/3+ " " + height/1.7 + " Z";
                } else {
                var labelLines = nodeText.split("\\n");
                
                var maxWidth = 0;
                    labelLines.forEach(function(line) {
                        var lineWidth = getCircleR(line);
                        maxWidth = Math.max(maxWidth, lineWidth);
                    });
                
                var r = maxWidth * 0.9
                return `M-${r},0 a${r},${r} 0 1,0 ${r * 2},0 a${r},${r} 0 1,0 -${r * 2},0`;
            }
            } else if (nodeText.includes('OR')) {
                return orGatePath;
            } else if (nodeText.includes('AND')) {
                return andGatePath;
            }
            else {

                var labelLines = nodeText.split("\\n");
                
                var maxWidth = 0;
                    labelLines.forEach(function(line) {
                        var lineWidth = getLabelWidth(line);
                        maxWidth = Math.max(maxWidth, lineWidth);
                    });


                
                var width = maxWidth + 20; // Adjust padding as needed
                var height = 50 * labelLines.length;
                return "M-" + width / 2 + " -" + height / 2 + " H" + width / 2 + " V" + height / 2 + " H-" + width / 2 + " Z";
            }
        }



        function getLabel(nodeText) { //nodeText is the last part after .
            if (nodeText.includes('OR')) {
                return '';
            } else if (nodeText.includes('AND')) {
                return '';
            } else {
                return nodeText.split("\\n")
            }
        }

        function getLabelWidth(label) {
            // Calculate the width based on the length of the label
            // You can adjust this calculation based on your requirements
            var characterWidth = 30 * 0.6; // Adjust this value based on font size and type
            return label.length * characterWidth;
        }

        function getCircleR(label) {
            // Calculate the width based on the length of the label
            // You can adjust this calculation based on your requirements
            var characterWidth = 30 * 0.3; // Adjust this value based on font size and type
            return label.length * characterWidth;
        }
        
        function toolPosition(pointerPosition,side){
            var el = document.getElementsByTagName("svg")[0];
            var out_widthX = el.getBoundingClientRect().width

            if(side === 'left'){
                if (pointerPosition > (900)){
                    return pointerPosition - 320
                } else {
                    return pointerPosition - 20
                }
            } else {
                if (pointerPosition > 800){
                    return pointerPosition - 200
                } else {
                    return pointerPosition - 120
                }
            }

        }

        var shapes = g1.selectAll(".symbol")
            .data(root.descendants())
            .join(
                (enter) => enter.append('path')
                .attr("class", 'symbol')
                .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })

                .attr('d', (d) => getShapePath(d, d.id.substring(d.id.lastIndexOf(".") + 1)))
                .style('fill', (d) => getShapeFill(d, d.id.substring(d.id.lastIndexOf(".") + 1)))
                .style('stroke-width', (d) => getShapeStroke(d, d.id.substring(d.id.lastIndexOf(".") + 1)))
                .style('stroke-dasharray',(d) => getShapeDash(d, d.id.substring(d.id.lastIndexOf(".") + 1))),
                (update) => update.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
                .attr('d', (d) => getShapePath(d, d.id.substring(d.id.lastIndexOf(".") + 1)))
                .style('fill', (d) => getShapeFill(d, d.id.substring(d.id.lastIndexOf(".") + 1)))
                .style('stroke-width', (d) => getShapeStroke(d, d.id.substring(d.id.lastIndexOf(".") + 1)))
                .style('stroke-dasharray',(d) => getShapeDash(d, d.id.substring(d.id.lastIndexOf(".") + 1))),
                (exit) => exit.remove()
                
            ).on("mouseenter", function(event, d){     // hovering effect
    
                    var Id = d.id.substring(d.id.lastIndexOf(".") + 1);
                    
                    var nodeSymbol = d.data.symbol
                    
                    
                    var toolText = descriptions[nodeSymbol]

                    // Find your root SVG element
                    var rootsvg = document.querySelector('svg');

                    // Create an SVGPoint for future math
                    var pt = rootsvg.createSVGPoint();

                    // Get point in global SVG space
                    function cursorPoint(evt){
                        pt.x = evt.clientX; pt.y = evt.clientY;
                        return pt.matrixTransform(rootsvg.getScreenCTM().inverse());
                    }

                    

                    if (!Id.includes('OR') && !Id.includes('AND')) {

                       
                        var loc = cursorPoint(event);
                               
                                    
                        d3.select(this)
                        
                            .style('fill', 'rgba(0, 211, 255)')
                            .style('stroke-width', '10px')
                        
                        var elX = this.getBoundingClientRect().x //+ this.getBoundingClientRect().width
                        var elY = this.getBoundingClientRect().y //+ this.getBoundingClientRect().height
                        console.log('x' + loc.x)
                        console.log('y' + loc.y)
                        if (loc.x < 2500 && loc.y < 1000){
                        tooltip.style('display', 'block')

                             .style('left', `${toolPosition(elX , 'left')}px`)
                             .style('top', `${toolPosition(elY - 50, 'top')}px`)

                        } else if (loc.x > 2500 && loc.y < 1000) {
                            tooltip.style('display', 'block')

                            .style('left', `${toolPosition(elX, 'left')}px`)
                            .style('top', `${toolPosition(elY - 50, 'top')}px`)

                        } else if (loc.x < 2500 && loc.y > 1000) {
                            tooltip.style('display', 'block')

                            .style('left', `${toolPosition(elX + 10, 'left')}px`)
                            .style('top', `${toolPosition(elY - 500, 'top')}px`)
                        } else if (loc.x > 2500 && loc.y > 1000) {
                            tooltip.style('display', 'block')

                            .style('left', `${toolPosition(elX, 'left')}px`)
                            .style('top', `${toolPosition(elY - 300, 'top')}px`)
                        }

                        tooltip.select('.title')
                        .style('text-align', 'left')
                            .text('Description:')
        
                        tooltip.select('.description span')
                            .html(toolText.description)
                    
                    }
                    
                        
                })
                .on('mouseleave', function(event, d){
                    var Id = d.id.substring(d.id.lastIndexOf(".") + 1);
                    d3.select(this)
                    .style('fill', getShapeFill(d, Id))
                    .style('stroke-width', getShapeStroke(d, Id))
        
                    tooltip.style('display', 'none')
                })
    

            function labelPositioning (d) {
                var nodeText = d.id.substring(d.id.lastIndexOf(".") + 1)
                var nodeSymbol = d.data.symbol

                if (nodeSymbol.includes("-triangle")) {
                    var labelLines = nodeText.split("\\n");
                    var totalHeight = labelLines.length * 15;
                    var yOffset = totalHeight / 2 - 20;
                    
                    return "translate(" + d.x + "," + (d.y - yOffset) + ")"
                } else if (nodeText.includes("\\n")) {
                    var labelLines = nodeText.split("\\n");
                    var totalHeight = labelLines.length * 15;
                    var yOffset = totalHeight / 2;

                    return "translate(" + d.x + "," + (d.y - yOffset) + ")"
                } else {
                return "translate(" + d.x + "," + d.y + ")"
            }
            }
    
            var labels = g2.selectAll(".label")
            .data(root.descendants())
            .join(
                (enter) => enter.append('text')
                    .attr("class", "label")
                    .attr("transform", (d) => labelPositioning(d))
                    .style("text-anchor", "middle")
                    .style("dominant-baseline", "middle")
                    .selectAll("tspan")
                    .data((d) => getLabel(d.id.substring(d.id.lastIndexOf(".") + 1))) // Use the result from getLabel
                    .join(
                        (enter) => enter.append("tspan")
                            .attr("x", 0)
                            .attr("dy", function(_, i) { return (i === 0 ? "0em" : "1em") ; })
                            .text((line) => line),
                        (update) => update.text((line) => line)
                    ),
                (update) => update.attr("transform", (d) => labelPositioning(d))
                    .selectAll("tspan")
                    .data((d) => getLabel(d.id.substring(d.id.lastIndexOf(".") + 1)))
                    .join(
                        (enter) => enter.append("tspan")
                            .attr("x", 0)
                            .attr("dy", function(_, i) { return (i === 0 ? "0em" : "1em"); })
                            .text((line) => line),
                        (update) => update.text((line) => line)
                    ),
                (exit) => exit.remove()
            );



        var zoom = d3.zoom()
            .on("zoom", zoomed)
            .extent([[0, 0], [width, height]])
            .scaleExtent([0.5, 1.5]);
        
        svg.call(zoom)
            

        svg.call(zoom.transform,d3.zoomIdentity.scale(0.5).translate(width,200));


        node.call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));
            
        function zoomed({transform}) {
            g.attr("transform", transform);
            g1.attr("transform", transform);
            g2.attr("transform", transform);
        }
        
        let isDragging = false; // Flag to track whether dragging is happening

        function dragstarted(event, d) {
            if (!event.active) {
                g.transition().duration(300).ease(d3.easeCubicOut);
                g1.transition().duration(300).ease(d3.easeCubicOut);
                g2.transition().duration(300).ease(d3.easeCubicOut);
                svg.transition().duration(300).ease(d3.easeCubicOut);
            
            }
            d3.select(this).raise();
            node.attr("cursor", "grabbing");
        }
        
        function dragged(event, d) {
            if (isDragging) {
                d.x = event.x;
                d.y = event.y;
                d3.select(this).attr("transform", `translate(${d.x},${d.y})`);
            }
        }
        
        function dragended() {
            if (!d3.event.active) {
                g.transition().duration(300).ease(d3.easeCubicOut);
                svg.transition().duration(300).ease(d3.easeCubicOut);
            }
            node.attr("cursor", "grab");
            isDragging = false; // Reset the flag when drag ends
        }

        node.on("dragstart", () => {
            isDragging = true;
        })

        // Select the reset zoom button
        var resetButton = document.getElementById("reset-zoom");

        // Add a click event listener to the reset button
        resetButton.addEventListener("click", function() {
        // Reset the zoom transformation
            svg.transition().duration(500).call(zoom.transform,d3.zoomIdentity.scale(0.5).translate(width,200));
        });

        function zoomed(event) {
            g.attr("transform", event.transform);
            g1.attr("transform", event.transform);
            g2.attr("transform", event.transform);
        }
    }

        // in this part we are writing a code that listens to the changes of the select button we added
    d3.select('#fmode')
        .on('change', function(e){  // on function listens for events on an element (here its change event)
        e.preventDefault()        // Stop the default behaviour of the browser

                 // this Holds the element thats tide to the event
        faultTree(this.value)       // this Holds the element thats tide to the event
        })      

    faultTree('quantitySymbol')
}


draw()