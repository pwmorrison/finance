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
const WIDTH = 600 - MARGIN.LEFT - MARGIN.RIGHT;
const HEIGHT = 400 - MARGIN.TOP - MARGIN.BOTTOM;
var x;
var y;
var xAxisGroup;
var yAxisGroup;
var g;


function setup_sim_vis() {
    

    let flag = true

    const svg = d3.select(".loan-simulator-frontend").append("svg")
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

    // X label
    g.append("text")
        .attr("class", "x axis-label")
        .attr("x", WIDTH / 2)
        .attr("y", HEIGHT + 60)
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .text("Month")

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
        .attr("transform", `translate(0, ${HEIGHT})`)

    yAxisGroup = g.append("g")

}

function update(data) {
    x.domain(data.map(d => d[0]));
    let max_y = d3.max(data, d => d[1]);
    y.domain([0, d3.max(data, d => d[1])]);
    //y.domain(data.map(d => d[1]));

    let v = y(-1000);

  
    const xAxisCall = d3.axisBottom(x)
    xAxisGroup.call(xAxisCall)
      .selectAll("text")
        .attr("y", "10")
        .attr("x", "-5")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-40)")
  
    const yAxisCall = d3.axisLeft(y)
      .ticks(3)
      .tickFormat(d => d + "m")
    yAxisGroup.call(yAxisCall)
  
    const rects = g.selectAll("rect")
      .data(data)
    
    rects.enter().append("rect")
      .attr("y", d => HEIGHT - y(d[1]))
      .attr("x", (d) => x(d[0]))
      .attr("width", x.bandwidth)
      //.attr("height", d => y(d[1]))
      .attr("height", 5)
      .attr("fill", "grey")
  }

function run_loan_simulator(msg) {
    let start_date = new Date("1/1/2000");
    console.log(start_date);
    let savings_account = new Savings(start_date, 100000000, 0.0, 0);
    let loan = new Loan("Loan", start_date, -500000, 0.05, savings_account, 1*12, false, null);
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
    
    console.log(msg)

    update(loan_history);
}

function Quiz(props) {
    const [isCorrect, setIsCorrect] = useState(undefined)
    const [isCorrectDelayed, setIsCorrectDelayed] = useState(undefined)

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
        setup_sim_vis();
        
        // TODO: Call from button presses.
        run_loan_simulator(msg);
      }, [msg])

      useEffect(() => {
        myFunc()
      }, [myFunc])

    return (
        <div className="loan-simulator-frontend">
            <p>Loan Simulator React</p>
        </div>
    )
}