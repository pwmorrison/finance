import React, {useState, useEffect, useCallback} from 'react'
import ReactDOM from 'react-dom'
import * as d3 from "d3";
//require('d3')
import "./frontend.scss"
import Savings from './investment'
import Loan from './loan'
import LoanSimulatorBar from './loan_simulator_bar'
import LoanSimulatorLine from './loan_simulator_line'
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





function Quiz(props) {
    const [isCorrect, setIsCorrect] = useState(undefined)
    const [isCorrectDelayed, setIsCorrectDelayed] = useState(undefined)

    const [loanStartBalance, setLoanStartBalance] = useState(1000000)
    const [interestRate, setInterestRate] = useState(0.05)
    const [loanLength, setLoanLength] = useState(12 * 1)
    const [interestOnlyPeriod, setInterestOnlyPeriod] = useState(3)

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
        loanSimulator.run_loan_simulator(loanStartBalance, interestRate, loanLength, interestOnlyPeriod);
    }

    const msg = "some message"

    const myFunc = useCallback(() => {
        //let sim = new LoanSimulatorBar();
        let sim = new LoanSimulatorLine();
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
          <div class="row">
            <div class="form-group col-md-3">
              <label for="startBalance">Start Balance</label>
              <div class="input-group">
                <div class="input-group-prepend">
                  <span class="input-group-text">$</span>
                </div>
                <input type="number" class="form-control" id="startBalance" placeholder="Enter start balance"
                  value={loanStartBalance} onChange={(b) => setLoanStartBalance(Number(b.target.value))}/>
              </div>
            </div>
            <div class="form-group col-md-3">
              <label for="interestRate">Interest Rate</label>
              <div class="input-group">
                <input type="number" class="form-control" id="interestRate" placeholder="Interest rate"
                  value={interestRate} onChange={(b) => setInterestRate(Number(b.target.value))}/>
                <div class="input-group-append">
                  <span class="input-group-text" id="basic-addon2">%</span>
                </div>
              </div>
            </div>
            <div class="form-group col-md-3">
              <label for="repaymentFrequency">Repayment Frequency</label>
              <select class="form-control" id="repaymentFrequency">
                <option>Monthly</option>
              </select>
            </div>
            <div class="form-group col-md-3">
              <label for="loanLength">Length of Loan</label>
              <div class="input-group">
                <input type="number" class="form-control" id="loanLength" placeholder="12"
                  value={loanLength} onChange={(b) => setLoanLength(Number(b.target.value))}/>
                <div class="input-group-append">
                  <span class="input-group-text" id="basic-addon2">months</span>
                </div>
              </div>
            </div>
          </div>
          <div class="row mt-2">
            <div class="form-group col-md-3">
            <label for="interestOnlyPeriod">Interest Only Period</label>
              <div class="input-group">
                <input type="number" class="form-control" id="interestOnlyPeriod" placeholder="3"
                value={interestOnlyPeriod} onChange={(b) => setInterestOnlyPeriod(Number(b.target.value))}/>
                <div class="input-group-append">
                  <span class="input-group-text" id="basic-addon2">months</span>
                </div>
              </div>
            </div>
          </div>
          <button class="btn btn-primary" onClick={handleRunSimulation}>Run Simulation</button>
        </form>
        
        {/* <input type="number" value={loanStartBalance} onChange={(b) => setLoanStartBalance(Number(b.target.value))}/> */}
        {/* <button onClick={() => loanSimulator.run_loan_simulator(loanStartBalance, interestRate, loanLength)}>Run simulation</button> */}
        {/* <Button class="btn btn-primary" onClick={() => loanSimulator.run_loan_simulator(loanStartBalance)}>Run!</Button> */}
        <div id="chart-area">
        </div>
        <div id="slider-div">
            <label>Date: <span id="dateLabel1">12/05/2013</span> - <span id="dateLabel2">31/10/2017</span></label>
            <div id="date-slider"></div>
        </div>
        <div id="chart-area-2">
        </div>
      </div>
    )
}