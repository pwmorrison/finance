
import * as d3 from "d3";
//require('d3')
import "./frontend.scss"
import Savings from './investment'
import Loan from './loan'
import LineChart from './lineChart'

import $ from 'jquery';


export default class LoanSimulatorLine{

		constructor() {
				// // TODO: Put these and all the functions in a class, so we don't need to store these globally.
				// this.MARGIN = { LEFT: 100, RIGHT: 10, TOP: 10, BOTTOM: 100 };
				// this.WIDTH = 1000 - this.MARGIN.LEFT - this.MARGIN.RIGHT;
				// this.HEIGHT = 800 - this.MARGIN.TOP - this.MARGIN.BOTTOM;
				// this.x;
				// this.y;
				// this.xAxisGroup;
				// this.yAxisGroup;
				// this.g;

				this.lineChart1 = new LineChart("#chart-area-2", "bitcoin");
		}


		setup_sim_vis() {

				// let flag = true

				// const svg = d3.select("#chart-area").append("svg")
				//     .attr("width", this.WIDTH + this.MARGIN.LEFT + this.MARGIN.RIGHT)
				//     .attr("height", this.HEIGHT + this.MARGIN.TOP + this.MARGIN.BOTTOM)

				// this.g = svg.append("g")
				//     .attr("transform", `translate(${this.MARGIN.LEFT}, ${this.MARGIN.TOP})`)

				// // g.append("rect")
				// //     .attr("y", 0)
				// //     .attr("x", 0)
				// //     .attr("width", WIDTH)
				// //     .attr("height", HEIGHT)
				// //     .attr("fill", "grey")

				// //var formatTime = d3.timeFormat("%d %B, %Y")

				// // X label
				// this.g.append("text")
				//     .attr("class", "x axis-label")
				//     .attr("x", this.WIDTH / 2)
				//     .attr("y", this.HEIGHT + 60)
				//     .attr("font-size", "20px")
				//     .attr("text-anchor", "middle")
				//     //.text("Month")

				// // Y label
				// const yLabel = this.g.append("text")
				//     .attr("class", "y axis-label")
				//     .attr("x", - (this.HEIGHT / 2))
				//     .attr("y", -30)
				//     .attr("font-size", "20px")
				//     .attr("text-anchor", "middle")
				//     .attr("transform", "rotate(-90)")
				//     .text("Balance")

				// this.x = d3.scaleBand()
				//     .range([0, this.WIDTH])
				//     .paddingInner(0.3)
				//     .paddingOuter(0.2)

				// this.y = d3.scaleLinear()
				//     .range([this.HEIGHT, 0])

				// this.xAxisGroup = this.g.append("g")
				//     .attr("class", "x axis")
				//     //.attr("transform", `translate(0, ${HEIGHT})`)

				// this.yAxisGroup = this.g.append("g")

		}

		update(data) {
				// const t = d3.transition().duration(750)

				// this.x.domain(data.map(d => d[0]));
				// // To handle negatives and positives, just map the data directly onto the axis.
				// this.y.domain(d3.extent(data, d => d[1]));

				// this.xAxisGroup.attr("transform", `translate(0, ${this.y(0)})`)
				//     //.attr("transform", `translate(0, ${HEIGHT})`)
		
				// const xAxisCall = d3.axisBottom(this.x)
				//     .tickFormat(d3.timeFormat("%d %B, %Y"));
				// this.xAxisGroup.call(xAxisCall)
				//     .selectAll("text")
				//     .attr("y", "10")
				//     .attr("x", "-5")
				//     .attr("text-anchor", "end")
				//     .attr("transform", "rotate(-40)")
				
				// const yAxisCall = d3.axisLeft(this.y)
				// //.ticks(3)
				// //.tickFormat(d => d + "m")
				// //.tickFormat(d3.timeFormat("%d %B, %Y"));
				// this.yAxisGroup.call(yAxisCall)
		
				// const rects = this.g.selectAll("rect")
				//     .data(data)

				// rects.exit().remove()

				// rects.enter().append("rect")
				//     .attr("fill", "grey")
				//     .attr("y", this.y(0))
				//     .attr("height", 0)
				//     // AND UPDATE old elements present in new data.
				//     .merge(rects)
				//     .transition(t)
				//         .attr("x", (d) => this.x(d[0]))
				//         .attr("width", this.x.bandwidth)
				//         .attr("y", d => Math.min(this.y(0), this.y(d[1])))
				//         .attr("height", d => Math.abs(this.y(d[1]) - this.y(0)))

				// // To deal with both positive and negative numbers, we either need to start each rectangle at the value (positive numbers), 
				// // or 0 (negative numbers). Whichever is closest to the top of the image.
				// // rects.enter().append("rect")
				// //     .attr("y", d => Math.min(this.y(0), this.y(d[1])))
				// //     .attr("x", (d) => this.x(d[0]))
				// //     .attr("width", this.x.bandwidth)
				// //     .attr("height", d => Math.abs(this.y(d[1]) - this.y(0)))
				// //     //.attr("height", 3)
				// //     .attr("fill", "grey")
		}

		run_loan_simulator(loan_start_balance, interest_rate, loan_length, interest_only_period) {

				if (loan_start_balance > 0) {
						loan_start_balance = -loan_start_balance;
				}

				let start_date = new Date("1/1/2000");
				console.log(start_date + " IO period: " + interest_only_period);
				let savings_account = new Savings(start_date, 100000000, 0.0, 0);
				let loan = new Loan("Loan", start_date, loan_start_balance, interest_rate, savings_account, loan_length, interest_only_period);
				let accounts = [savings_account, loan];

				let current_date = start_date
				console.log(current_date + " - " + loan.balance);
				let i = 0;
				while (true) {
						
						// Make a copy of the date so we don't change the date history.
						current_date = new Date(current_date.getTime());
						current_date.setMonth(current_date.getMonth() + 1);

						accounts.forEach((a, i) => a.process_transactions(current_date));

						console.log(current_date + " - " + loan.balance)

						if (loan.balance == 0) {
								break;
						}

						i++;
						if (i >= 1000) {
								break;
						}
				}
				let loan_history = loan.balance_history;
				console.log(loan_history);

				// time parsers/formatters
				const parseTime = d3.timeParse("%d/%m/%Y")
				const formatTime = d3.timeFormat("%d/%m/%Y")

				// add jQuery UI slider
				$("#date-slider").slider({
						range: true,
						max: parseTime("31/10/2017").getTime(),
						min: parseTime("12/5/2013").getTime(),
						step: 86400000, // one day
						values: [
								parseTime("12/5/2013").getTime(),
								parseTime("31/10/2017").getTime()
						],
						slide: (event, ui) => {
								$("#dateLabel1").text(formatTime(new Date(ui.values[0])))
								// $("#dateLabel2").text(formatTime(new Date(ui.values[1])))
								// updateCharts()
						}
				})

				//this.update(loan_history);
				this.lineChart1.wrangleData(loan_history);
		}
}
