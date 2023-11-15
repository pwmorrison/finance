import React, {useState, useEffect, useCallback} from 'react'
import ReactDOM from 'react-dom'
import * as d3 from "d3";
//require('d3')
import "./frontend.scss"
import LoanSimulator from './loan_simulator'
import 'bootstrap/dist/css/bootstrap.min.css';
import "bootstrap/dist/js/bootstrap.bundle.min";

const divsToUpdate = document.querySelectorAll(".loan-simulator-update-me")

divsToUpdate.forEach(function(div) {
    const data = JSON.parse(div.querySelector("pre").innerHTML)
    ReactDOM.render(<LoanSimulatorComponent {...data}/>, div)
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

function LoanSimulatorComponent(props) {
  const [loanStartBalance, setLoanStartBalance] = useState(1000000)
  const [interestRate, setInterestRate] = useState(5)
  const [loanLength, setLoanLength] = useState(12 * 1)
  const [interestOnlyPeriod, setInterestOnlyPeriod] = useState(3)
  const [loanSimulator, setLoanSimulator] = useState(undefined)

  function handleRunSimulation(event) {
    event.preventDefault();  // Stop the browser refreshing on form submit.
    loanSimulator.run_loan_simulator(loanStartBalance, interestRate / 100, loanLength, interestOnlyPeriod);
  }

  useEffect(() => {
    let sim = new LoanSimulator();
    console.log(sim);
    sim.run_loan_simulator(loanStartBalance, interestRate / 100, loanLength, interestOnlyPeriod);
    setLoanSimulator(sim);
  }, [])

  return (
    <div className="loan-simulator-frontend">
      <p>Loan Simulator React</p>
      <form>
        <div class="row">
          <div class="form-group col-md-3">
            <label for="startBalance">Start Balance</label>
            <div class="input-group">
              <div class="input-group-prepend">
                <span class="input-group-text rounded-0">$</span>
              </div>
              <input type="number" class="form-control rounded-0" id="startBalance" placeholder="Enter start balance"
                value={loanStartBalance} onChange={(b) => setLoanStartBalance(b.target.value)} step="10000" min="0.000001"/>
            </div>
          </div>
          <div class="form-group col-md-3">
            <label for="interestRate">Interest Rate</label>
            <div class="input-group">
              <input type="number" class="form-control rounded-0" id="interestRate" placeholder="Enter interest rate"
                value={interestRate} onChange={(b) => setInterestRate(b.target.value)} step="0.1" min="0"/>
              <div class="input-group-append">
                <span class="input-group-text rounded-0" id="basic-addon2">%</span>
              </div>
            </div>
          </div>
          <div class="form-group col-md-3">
            <label for="repaymentFrequency">Repayment Frequency</label>
            <select class="form-control rounded-0" id="repaymentFrequency">
              <option>Monthly</option>
            </select>
          </div>
          <div class="form-group col-md-3">
            <label for="loanLength">Length of Loan</label>
            <div class="input-group">
              <input type="number" class="form-control rounded-0" id="loanLength" placeholder="Enter length of loan"
                value={loanLength} onChange={(b) => setLoanLength(b.target.value)} min="0"/>
              <div class="input-group-append">
                <span class="input-group-text rounded-0" id="basic-addon2">months</span>
              </div>
            </div>
          </div>
        </div>
        <div class="row mt-2">
          <div class="form-group col-md-3">
          <label for="interestOnlyPeriod">Interest Only Period</label>
            <div class="input-group">
              <input type="number" class="form-control rounded-0" id="interestOnlyPeriod" placeholder="Enter IO period"
                value={interestOnlyPeriod} onChange={(b) => setInterestOnlyPeriod(b.target.value)} min="0"/>
              <div class="input-group-append">
                <span class="input-group-text rounded-0" id="basic-addon2">months</span>
              </div>
            </div>
          </div>
        </div>
        <button class="btn btn-primary" onClick={handleRunSimulation}>Run Simulation</button>
      </form>
      <div id="slider-div">
        <label>Date: <span id="dateLabel1">12/05/2013</span> - <span id="dateLabel2">31/10/2017</span></label>
        <div id="date-slider"></div>
      </div>
      <div id="chart-area">
      </div>
    </div>
  )
}