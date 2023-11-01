import React, {useState, useEffect, useCallback} from 'react'
import ReactDOM from 'react-dom'
import * as d3 from "d3";
//require('d3')
import "./frontend.scss"
import Savings from './investment'
import Loan from './loan'
//import Button from 'react-bootstrap/Button';
//import Container from 'react-bootstrap/Container'
//import Row from 'react-bootstrap/Row'
//import Col from 'react-bootstrap/Col'
//import Form from 'react-bootstrap/Form';
//import Card from 'react-bootstrap/Card'
import 'bootstrap/dist/css/bootstrap.min.css';
import "bootstrap/dist/js/bootstrap.bundle.min";

const divsToUpdate = document.querySelectorAll(".loan-simulator-update-me")

divsToUpdate.forEach(function(div) {
    const data = JSON.parse(div.querySelector("pre").innerHTML)
    ReactDOM.render(<Quiz {...data}/>, div)
    div.classList.remove("loan-simulator-update-me")
})


/*
The loan calculator that doesn't suck.

Features:
* Display all data - loan balance, repayments divided by total/interest/principal, accumulated interest paid, accumulated principal paid.
* Display totals - montly repayments in and outside the IO period, total repayments, total interest paid, time to completion, time saved.
* Extra repayments, including recurring and one-off.
* Linked offset account with monthly income, expenses and one-off inputs/outputs.
* Compare different scenarios: IO terms, P&I, variations of the above features.
* Provide link so the user can come back to their results and make changes.
* Download results data.
*/

/*
What should the UI look like?
A pane per scenario.
For each pane, have options along the top, and results graphs below.
If multiple scenarios, do a comparison down the bottom.
Start with simple options, and have the advanced options available if selected.
*/


class LoanSimulator {

    constructor() {
        // TODO: Put these and all the functions in a class, so we don't need to store these globally.
        this.MARGIN = { LEFT: 100, RIGHT: 10, TOP: 10, BOTTOM: 100 };
        this.WIDTH = 1000 - this.MARGIN.LEFT - this.MARGIN.RIGHT;
        this.HEIGHT = 800 - this.MARGIN.TOP - this.MARGIN.BOTTOM;
        this.x;
        this.y;
        this.xAxisGroup;
        this.yAxisGroup;
        this.g;
    }


    setup_sim_vis() {
        

        let flag = true

        const svg = d3.select("#chart-area").append("svg")
            .attr("width", this.WIDTH + this.MARGIN.LEFT + this.MARGIN.RIGHT)
            .attr("height", this.HEIGHT + this.MARGIN.TOP + this.MARGIN.BOTTOM)

        this.g = svg.append("g")
            .attr("transform", `translate(${this.MARGIN.LEFT}, ${this.MARGIN.TOP})`)

        // g.append("rect")
        //     .attr("y", 0)
        //     .attr("x", 0)
        //     .attr("width", WIDTH)
        //     .attr("height", HEIGHT)
        //     .attr("fill", "grey")

        //var formatTime = d3.timeFormat("%d %B, %Y")

        // X label
        this.g.append("text")
            .attr("class", "x axis-label")
            .attr("x", this.WIDTH / 2)
            .attr("y", this.HEIGHT + 60)
            .attr("font-size", "20px")
            .attr("text-anchor", "middle")
            //.text("Month")

        // Y label
        const yLabel = this.g.append("text")
            .attr("class", "y axis-label")
            .attr("x", - (this.HEIGHT / 2))
            .attr("y", -30)
            .attr("font-size", "20px")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .text("Balance")

        this.x = d3.scaleBand()
            .range([0, this.WIDTH])
            .paddingInner(0.3)
            .paddingOuter(0.2)

        this.y = d3.scaleLinear()
            .range([this.HEIGHT, 0])

        this.xAxisGroup = this.g.append("g")
            .attr("class", "x axis")
            //.attr("transform", `translate(0, ${HEIGHT})`)

        this.yAxisGroup = this.g.append("g")

    }

    update(data) {
        const t = d3.transition().duration(750)

        this.x.domain(data.map(d => d[0]));
        // To handle negatives and positives, just map the data directly onto the axis.
        this.y.domain(d3.extent(data, d => d[1]));

        this.xAxisGroup.attr("transform", `translate(0, ${this.y(0)})`)
            //.attr("transform", `translate(0, ${HEIGHT})`)
    
        const xAxisCall = d3.axisBottom(this.x)
            .tickFormat(d3.timeFormat("%d %B, %Y"));
        this.xAxisGroup.call(xAxisCall)
            .selectAll("text")
            .attr("y", "10")
            .attr("x", "-5")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-40)")
        
        const yAxisCall = d3.axisLeft(this.y)
        //.ticks(3)
        //.tickFormat(d => d + "m")
        //.tickFormat(d3.timeFormat("%d %B, %Y"));
        this.yAxisGroup.call(yAxisCall)
    
        const rects = this.g.selectAll("rect")
            .data(data)

        rects.exit().remove()

        rects.enter().append("rect")
            .attr("fill", "grey")
            .attr("y", this.y(0))
            .attr("height", 0)
            // AND UPDATE old elements present in new data.
            .merge(rects)
            .transition(t)
                .attr("x", (d) => this.x(d[0]))
                .attr("width", this.x.bandwidth)
                .attr("y", d => Math.min(this.y(0), this.y(d[1])))
                .attr("height", d => Math.abs(this.y(d[1]) - this.y(0)))

        // To deal with both positive and negative numbers, we either need to start each rectangle at the value (positive numbers), 
        // or 0 (negative numbers). Whichever is closest to the top of the image.
        // rects.enter().append("rect")
        //     .attr("y", d => Math.min(this.y(0), this.y(d[1])))
        //     .attr("x", (d) => this.x(d[0]))
        //     .attr("width", this.x.bandwidth)
        //     .attr("height", d => Math.abs(this.y(d[1]) - this.y(0)))
        //     //.attr("height", 3)
        //     .attr("fill", "grey")
    }

    run_loan_simulator(loan_start_balance, interest_rate, loan_length) {

        if (loan_start_balance > 0) {
            loan_start_balance = -loan_start_balance;
        }

        let start_date = new Date("1/1/2000");
        console.log(start_date);
        let savings_account = new Savings(start_date, 100000000, 0.0, 0);
        let loan = new Loan("Loan", start_date, loan_start_balance, interest_rate, savings_account, loan_length, false, null);
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

        this.update(loan_history);
    }
}


function Quiz(props) {
    const [isCorrect, setIsCorrect] = useState(undefined)
    const [isCorrectDelayed, setIsCorrectDelayed] = useState(undefined)

    const [loanStartBalance, setLoanStartBalance] = useState(1000000)
    const [interestRate, setInterestRate] = useState(0.05)
    const [loanLength, setLoanLength] = useState(12 * 1)

    const [loanSimulator, setLoanSimulator] = useState(undefined)

    useEffect(() => {
        if (isCorrect === false) {
            setTimeout(() => {
                setIsCorrect(undefined)
            }, 2600)
        }

        if (isCorrect === true) {
            setTimeout(() => {
                setIsCorrectDelayed(true)
            }, 1000)
        }
    }, [isCorrect])

    function handleAnswer(index) {
        if (index == props.correctAnswer) {
            setIsCorrect(true)
        } else {
            setIsCorrect(false)
        }
    }

    function handleRunSimulation(event) {
        event.preventDefault();  // Stop the browser refreshing on form submit.
        loanSimulator.run_loan_simulator(loanStartBalance, interestRate, loanLength);
    }

    const msg = "some message"

    const myFunc = useCallback(() => {
        let sim = new LoanSimulator();
        console.log(sim);
        sim.setup_sim_vis();
        setLoanSimulator(sim);
        
      }, [msg])

      useEffect(() => {
        myFunc()
      }, [myFunc])

    return (
        <div className="loan-simulator-frontend">
            <p>Loan Simulator React</p>
            <form>
                <div class="form-group">
                    <label for="startBalance">Start Balance</label>
                    <input type="number" class="form-control" id="startBalance" placeholder="Enter start balance"
                    value={loanStartBalance} onChange={(b) => setLoanStartBalance(Number(b.target.value))}/>
                </div>
                <div class="form-group">
                    <label for="interestRate">Interest Rate (%)</label>
                    <input type="number" class="form-control" id="interestRate" placeholder="Interest rate"
                    value={interestRate} onChange={(b) => setInterestRate(Number(b.target.value))}/>
                </div>
                <div class="form-group">
                    <label for="repaymentFrequency">Repayment Frequency</label>
                    <select class="form-control" id="repaymentFrequency">
                        <option>Monthly</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="loanLength">Length of Loan (months)</label>
                    <input type="number" class="form-control" id="loanLength" placeholder="12"
                    value={loanLength} onChange={(b) => setLoanLength(Number(b.target.value))}/>
                </div>
                <button class="btn btn-primary" onClick={handleRunSimulation}>Run Simulation</button>
            </form>
            <div class="container">
                <div class="row">
                    <div class="col-sm">
                    One of three columns
                    </div>
                    <div class="col-sm">
                    One of three columns
                    </div>
                    <div class="col-sm">
                    One of three columns
                    </div>
                </div>
            </div>
            <input type="number" value={loanStartBalance} onChange={(b) => setLoanStartBalance(Number(b.target.value))}/>
            <button onClick={() => loanSimulator.run_loan_simulator(loanStartBalance, interestRate, loanLength)}>Run simulation</button>
            {/* <Button class="btn btn-primary" onClick={() => loanSimulator.run_loan_simulator(loanStartBalance)}>Run!</Button> */}
            <div id="chart-area">
            </div>
        </div>
    )
}