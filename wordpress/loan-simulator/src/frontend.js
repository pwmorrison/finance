import React, {useState, useEffect, useCallback} from 'react'
import ReactDOM from 'react-dom'
import * as d3 from "d3";
//require('d3')
import "./frontend.scss"
import Savings from './investment'
import Loan from './loan'

const divsToUpdate = document.querySelectorAll(".loan-simulator-update-me")

divsToUpdate.forEach(function(div) {
    const data = JSON.parse(div.querySelector("pre").innerHTML)
    ReactDOM.render(<Quiz {...data}/>, div)
    div.classList.remove("loan-simulator-update-me")
})

// TODO: Put these and all the functions in a class, so we don't need to store these globally.
const MARGIN = { LEFT: 100, RIGHT: 10, TOP: 10, BOTTOM: 100 };
const WIDTH = 1000 - MARGIN.LEFT - MARGIN.RIGHT;
const HEIGHT = 800 - MARGIN.TOP - MARGIN.BOTTOM;
var x;
var y;
var xAxisGroup;
var yAxisGroup;
var g;


class LoanSimulator {

    constructor() {

    }


    setup_sim_vis() {
        

        let flag = true

        const svg = d3.select("#chart-area").append("svg")
            .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
            .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)

        g = svg.append("g")
            .attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)

        // g.append("rect")
        //     .attr("y", 0)
        //     .attr("x", 0)
        //     .attr("width", WIDTH)
        //     .attr("height", HEIGHT)
        //     .attr("fill", "grey")

        //var formatTime = d3.timeFormat("%d %B, %Y")

        // X label
        g.append("text")
            .attr("class", "x axis-label")
            .attr("x", WIDTH / 2)
            .attr("y", HEIGHT + 60)
            .attr("font-size", "20px")
            .attr("text-anchor", "middle")
            //.text("Month")

        // Y label
        const yLabel = g.append("text")
            .attr("class", "y axis-label")
            .attr("x", - (HEIGHT / 2))
            .attr("y", -30)
            .attr("font-size", "20px")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .text("Balance")

        x = d3.scaleBand()
            .range([0, WIDTH])
            .paddingInner(0.3)
            .paddingOuter(0.2)

        y = d3.scaleLinear()
            .range([HEIGHT, 0])

        xAxisGroup = g.append("g")
            .attr("class", "x axis")
            //.attr("transform", `translate(0, ${HEIGHT})`)

        yAxisGroup = g.append("g")

    }

    update(data) {
        x.domain(data.map(d => d[0]));
        // To handle negatives and positives, just map the data directly onto the axis.
        y.domain(d3.extent(data, d => d[1]));

        xAxisGroup.attr("transform", `translate(0, ${y(0)})`)
            //.attr("transform", `translate(0, ${HEIGHT})`)
    
        const xAxisCall = d3.axisBottom(x)
            .tickFormat(d3.timeFormat("%d %B, %Y"));
        xAxisGroup.call(xAxisCall)
            .selectAll("text")
            .attr("y", "10")
            .attr("x", "-5")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-40)")
        
        const yAxisCall = d3.axisLeft(y)
        //.ticks(3)
        //.tickFormat(d => d + "m")
        //.tickFormat(d3.timeFormat("%d %B, %Y"));
        yAxisGroup.call(yAxisCall)
    
        const rects = g.selectAll("rect")
        .data(data)
        
        // To deal with both positive and negative numbers, we either need to start each rectangle at the value (positive numbers), 
        // or 0 (negative numbers). Whichever is closest to the top of the image.
        rects.enter().append("rect")
        .attr("y", d => Math.min(y(0), y(d[1])))
        .attr("x", (d) => x(d[0]))
        .attr("width", x.bandwidth)
        .attr("height", d => Math.abs(y(d[1]) - y(0)))
        //.attr("height", 3)
        .attr("fill", "grey")
    }

    run_loan_simulator(loan_start_balance) {

        if (loan_start_balance > 0) {
            loan_start_balance = -loan_start_balance;
        }

        let start_date = new Date("1/1/2000");
        console.log(start_date);
        let savings_account = new Savings(start_date, 100000000, 0.0, 0);
        let loan = new Loan("Loan", start_date, loan_start_balance, 0.05, savings_account, 1*12, false, null);
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

    const [loanStartBalance, setLoanStartBalance] = useState(undefined)

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
            <input type="number" value={loanStartBalance} onChange={(b) => setLoanStartBalance(Number(b.target.value))}/>
            <button onClick={() => loanSimulator.run_loan_simulator(loanStartBalance)}>Run simulation</button>
            <div id="chart-area">
            </div>
        </div>
    )
}