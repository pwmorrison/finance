
//import * as d3 from "d3";
//require('d3')
import "./frontend.scss"
import Savings from './investment'
import Loan from './loan'
import LineChart from './lineChart'
import Timeline from './timeline'

import $ from 'jquery';

// time parsers/formatters
const parseTime = d3.timeParse("%d/%m/%Y")
const formatTime = d3.timeFormat("%d/%m/%Y")

export default class LoanSimulator{

	constructor() {
			this.lineChart1 = new LineChart("#chart-area", "bitcoin", ["balance", "amount_owing"]);

			this.timeline = new Timeline('#timeline', this.brushed, this.lineChart1);

			
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

		// add jQuery UI slider
		$("#dateLabel1").text(formatTime(start_date))
		$("#dateLabel2").text(formatTime(current_date))
		$("#date-slider").slider({
				range: true,
				max: current_date.getTime(),//parseTime("31/10/2017").getTime(),
				min: start_date.getTime(),//parseTime("12/5/2013").getTime(),
				step: 86400000, // one day
				values: [
						start_date.getTime(),//parseTime("12/5/2013").getTime(),
						current_date.getTime()//parseTime("31/10/2017").getTime()
				],
				slide: (event, ui) => {
					if (0) {
						$("#dateLabel1").text(this.formatTime(new Date(ui.values[0])))
						$("#dateLabel2").text(this.formatTime(new Date(ui.values[1])))
						// updateCharts()
						this.lineChart1.wrangleData(loan_history);
					} else {
						// Pass the selected dates through the brush, which then updates the plot.
						const dates = ui.values.map(val => new Date(val))
						const xVals = dates.map(date => timeline.x(date))

						timeline.brushComponent.call(timeline.brush.move, xVals)
					}
				}
		})

		//this.update(loan_history);
		this.lineChart1.wrangleData(loan_history);
		this.timeline.wrangleData(loan_history);
	}

	// TODO: Make this a callback function that is independent of d3, so that "this" refers to the class instance, not the callback context.
	brushed(val, timeline) {
		console.log("CALLED BRUSHED FN" + val)
		console.log(timeline);
		const selection = d3.event.selection || timeline.x.range()
		const newValues = selection.map(timeline.x.invert)

		
	
		$("#date-slider")
			.slider('values', 0, newValues[0])
			.slider('values', 1, newValues[1])
		$("#dateLabel1").text(formatTime(newValues[0]))
		$("#dateLabel2").text(formatTime(newValues[1]))
	
		this.lineChart1.wrangleData()
	}
}
