/*
*    lineChart.js
*    Mastering Data Visualization with D3.js
*    10.4 - Converting our code to OOP
*/

export default class LineChart {
	// constructor function - make a new visualization object.
	constructor(_parentElement, _coin, _keys) {
		this.parentElement = _parentElement
		this.coin = _coin
		this.keys = _keys;

		this.initVis()
	}

	// initVis method - set up static parts of our visualization.
	initVis() {
		const vis = this

		vis.MARGIN = { LEFT: 50, RIGHT: 20, TOP: 50, BOTTOM: 50 }
		vis.WIDTH = 700 - vis.MARGIN.LEFT - vis.MARGIN.RIGHT
		vis.HEIGHT = 500 - vis.MARGIN.TOP - vis.MARGIN.BOTTOM
		
		vis.svg = d3.select(vis.parentElement).append("svg")
			.attr("width", vis.WIDTH + vis.MARGIN.LEFT + vis.MARGIN.RIGHT)
			.attr("height", vis.HEIGHT + vis.MARGIN.TOP + vis.MARGIN.BOTTOM)
		
		vis.g = vis.svg.append("g")
			.attr("transform", `translate(${vis.MARGIN.LEFT}, ${vis.MARGIN.TOP})`)
		
		// time parsers/formatters
		vis.parseTime = d3.timeParse("%d/%m/%Y")
		vis.formatTime = d3.timeFormat("%d/%m/%Y")
		vis.formatAmount = d3.format("$,.2f")
		// for tooltip
		vis.bisectDate = d3.bisector(d => d["date"]).left
		
		// add the line for the first time
		for (let key of this.keys) {
			vis.g.append("path")
				.attr("class", "line-" + key)
				.attr("fill", "none")
				.attr("stroke", "grey")
				.attr("stroke-width", "3px")	
		}
		// vis.g.append("path")
		// 	.attr("class", "line")
		// 	.attr("fill", "none")
		// 	.attr("stroke", "grey")
		// 	.attr("stroke-width", "3px")
		
		// axis labels
		vis.xLabel = vis.g.append("text")
			.attr("class", "x axisLabel")
			.attr("y", vis.HEIGHT + 50)
			.attr("x", vis.WIDTH / 2)
			.attr("font-size", "20px")
			.attr("text-anchor", "middle")
			.text(vis.coin)
		vis.yLabel = vis.g.append("text")
			.attr("class", "y axisLabel")
			.attr("transform", "rotate(-90)")
			.attr("y", -60)
			.attr("x", -170)
			.attr("font-size", "20px")
			.attr("text-anchor", "middle")
			.text("Price ($)")
		
		// scales
		vis.x = d3.scaleTime().range([0, vis.WIDTH])
		vis.y = d3.scaleLinear().range([vis.HEIGHT, 0])
		
		// axis generators
		vis.xAxisCall = d3.axisBottom()
			.ticks(3)
		vis.yAxisCall = d3.axisLeft()
			.ticks(6)
			.tickFormat(d => `${parseInt(d / 1000)}k`)
		
		// axis groups
		vis.xAxis = vis.g.append("g")
			.attr("class", "x axis")
			.attr("transform", `translate(0, ${vis.HEIGHT})`)
		vis.yAxis = vis.g.append("g")
			.attr("class", "y axis")
				
		//vis.wrangleData()
	}

	// wrangleData method - selecting/filtering the data that we want to use.
	wrangleData(data) {
		const vis = this

		// filter data based on selections
		// vis.yValue = $("#var-select").val()
		// vis.sliderValues = $("#date-slider").slider("values")
		// vis.dataTimeFiltered = filteredData[vis.coin].filter(d => {
		// 	return ((d.date >= vis.sliderValues[0]) && (d.date <= vis.sliderValues[1]))
		// })

    vis.dataTimeFiltered = data
		vis.updateVis()
	}

	// updateVis method - updating our elements to match the new data.
	updateVis() {
		const vis = this

		vis.t = d3.transition().duration(1000)

    console.log("dataTimeFiltered: " + vis.dataTimeFiltered);

		// update scales
		vis.x.domain(d3.extent(vis.dataTimeFiltered, d => d["date"]))
		// vis.y.domain([
		// 	d3.min(vis.dataTimeFiltered, d => d["balance"]) / 1.005, 
		// 	d3.max(vis.dataTimeFiltered, d => d["balance"]) * 1.005
		// ])

		// Use the maximum key value at each time step.
		vis.y.domain([
			d3.min(vis.dataTimeFiltered, d => d3.min(vis.keys.map(k => d[k]))) / 1.005, 
			d3.max(vis.dataTimeFiltered, d => d3.max(vis.keys.map(k => d[k]))) * 1.005
		])
	
		// fix for format values
		const formatSi = d3.format(".2s")
		function formatAbbreviation(x) {
			const s = formatSi(x)
			switch (s[s.length - 1]) {
				case "G": return s.slice(0, -1) + "B" // billions
				case "k": return s.slice(0, -1) + "K" // thousands
			}
			return s
		}
	
		// update axes
		vis.xAxisCall.scale(vis.x)
		vis.xAxis.transition(vis.t).call(vis.xAxisCall)
		vis.yAxisCall.scale(vis.y)
		vis.yAxis.transition(vis.t).call(vis.yAxisCall.tickFormat(formatAbbreviation))
	
		// clear old tooltips
		vis.g.select(".focus").remove()
		vis.g.select(".overlay").remove()
	
		/******************************** Tooltip Code ********************************/
	
		if (1) {
				// Focus group housing the focus circle, lines, and text.
				// Gets translated to the data point closest to the mouse location.
				vis.focus = vis.g.append("g")
						.attr("class", "focus")
						.style("display", "none")
		
				// Single vertical line from the highest data point to the x-axis.
				vis.focus.append("line")
						.attr("class", "x-hover-line hover-line")
						.attr("y1", 0)
						.attr("y2", vis.HEIGHT)
		
				// Add components for each key.
				for (let key of vis.keys) {
					// Horizontal line from the data point to the y-axis.
					vis.focus.append("line")
						.attr("id", "line-" + key)
						.attr("class", "y-hover-line hover-line")
						.attr("x1", 0)
						.attr("x2", vis.WIDTH)
				
					// Circle at the top-left corder of the focus group.
					vis.focus.append("circle")
						.attr("id", "circle-" + key)
						.attr("r", 7.5)

					// Text relative to the top-left corner of the focus group.
					// The group is translated to the data point, which moves the text.
					vis.focus.append("text")
						.attr("id", "text-" + key)
						.attr("x", 15)
						.attr("dy", ".31em")	
				}
		
				
		
				// Overlay rectangle covering the entire plot.
				// Shows/hides the focus group, and captures mouse movements within the plot.
				vis.g.append("rect")
						.attr("class", "overlay")
						.attr("width", vis.WIDTH)
						.attr("height", vis.HEIGHT)
						.on("mouseover", () => vis.focus.style("display", null))
						.on("mouseout", () => vis.focus.style("display", "none"))
						.on("mousemove", mousemove)
		
				// Find the data point closest to the mouse location.
				// Translate the focus group to the data point.
				// Extend the vertical (x) line down to the x-axis.
				// Extend the horizontal (y) line to the left to the y-axis.
				function mousemove() {
						const x0 = vis.x.invert(d3.mouse(this)[0])
						const i = vis.bisectDate(vis.dataTimeFiltered, x0, 1)
						const d0 = vis.dataTimeFiltered[i - 1]
						const d1 = vis.dataTimeFiltered[i]
						const d = x0 - d0["date"] > d1["date"] - x0 ? d1 : d0
						//vis.focus.attr("transform", `translate(${vis.x(d["date"])}, ${vis.y(d["balance"])})`)
						vis.focus.attr("transform", `translate(${vis.x(d["date"])}, 0)`)  // Only translate horizontally, so we can overlay all lines.
						for (let key of vis.keys) {
							vis.focus.select("#circle-" + key)
								.attr("transform", `translate(0, ${vis.y(d[key])})`)  // Translate the circle downward.						
							
							vis.focus.select("#text-" + key)  // Move text the the right of the data point.
								.text(vis.formatAmount(d[key]))
								.attr("y", vis.y(d[key]))

							vis.focus.select("#line-" + key)  // Draw horizontal line from the point to the y-axis.
								.attr("x2", -vis.x(d["date"]))
								.attr("y1", vis.y(d[key]))
								.attr("y2", vis.y(d[key]))
						}
						//vis.focus.select(".x-hover-line").attr("y2", vis.HEIGHT - vis.y(d["balance"]))
						vis.focus.select(".x-hover-line")  // Draw vertical line from the highest point to the x-axis.
							.attr("y1", vis.y(d3.max(vis.keys.map(k => d[k]))))
							//.attr("y1", vis.y(d["balance"]))
							.attr("y2", vis.HEIGHT)
						//vis.focus.select(".y-hover-line").attr("x2", -vis.x(d["date"]))
						
				}
		}
		
		/******************************** Tooltip Code ********************************/
	
		vis.lines = {};
		for (let key of vis.keys) {
			// Path generator
			vis.lines[key] = d3.line()
				.x(d => vis.x(d["date"]))
				.y(d => vis.y(d[key]))

			// Update our line path
			vis.g.select(".line-" + key)
				.transition(vis.t)
				.attr("d", vis.lines[key](vis.dataTimeFiltered))	
		}
		// // Path generator
		// vis.line = d3.line()
		// 	.x(d => vis.x(d["date"]))
		// 	.y(d => vis.y(d["balance"]))
	
		// // Update our line path
		// vis.g.select(".line")
		// 	.transition(vis.t)
		// 	.attr("d", vis.line(vis.dataTimeFiltered))
	
		// Update y-axis label
		const newText = (vis.yValue === "price_usd") ? "Price ($)" 
			: (vis.yValue === "market_cap") ? "Market Capitalization ($)" 
				: "24 Hour Trading Volume ($)"
		vis.yLabel.text(newText)
	}
}

