
import { compute_monthly_interest } from "./utils";
import Account from "./account";


export default class Savings extends Account {
    
    constructor(initial_balance, interest_rate, monthly_investment_funds) {
        super(initial_balance);
        this.initial_balance = initial_balance;
        this.interest_rate = interest_rate;
        this.monthly_investment_funds = monthly_investment_funds;
        this.extra_monthly_investment_funds = 0;
        this.loan_to_repay = null;
        //this.balance = initial_balance
        //this.balance_history = [];
    }

    set_loan_to_repay(loan) {
        this.loan_to_repay = loan;
    }

    process_transactions(current_date) {

        this.accrue_interest()

        // TODO: Pay expenses (or consider this as another Account that withdraws from here).
        // Make additional loan payments with our monthly investment funds.
        if (this.loan_to_repay != null) {
            balance = this.loan_to_repay.get_balance();
            payment = this.monthly_investment_funds + this.extra_monthly_investment_funds;
            if (balance < 0) {
                amount = min(payment, -balance);
                amount = this.withdraw(amount);
                this.loan_to_repay.deposit(amount);
            }
        }

        this.balance_history.push(this.balance);
    }

    accrue_interest() {
        let interest = compute_monthly_interest(this.balance, this.interest_rate, 0);
        this.balance += interest;
    }

    // Move to Account base class.
    //deposit(amount) {
    //    this.balance += amount;
    //}

    
}