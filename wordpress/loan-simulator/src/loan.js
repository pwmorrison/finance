
import { compute_monthly_interest } from "./utils";
import Account from "./account";

function calculate_p_i_monthly_repayment(balance, interest_rate, loan_term_months) {
    // Calculate the P&I repayments needed to bring the loan to 0 at the expiry of the loan.
    // https://www.moneygeek.com/personal-loans/calculate-loan-payments/
    // P = a / {(1 + r)^n - 1} / [r(1 + r)^n]
    // P is your monthly loan payment
    // a is your principal
    // r is your periodic interest rate, which is your interest rate divided by 12
    // n is the total number of months in your loan term
    const a = Math.abs(balance);
    const r = interest_rate / 12;
    const n = loan_term_months;
    const X = (1 + r) ** n - 1;
    const Y = r * (1 + r) ** n;
    const Z = X / Y;
    const P = a / Z;
    return P;
}

function calculate_io_monthly_repayment(balance, interest_rate) {
    // Calculate IO monthly repayments.
    // https://www.moneygeek.com/personal-loans/calculate-loan-payments/
    const a = Math.abs(balance);
    const r = interest_rate;
    const n = 12;
    const P = a * (r / n);
    return P;
}


export default class Loan extends Account {
    constructor(name, start_date, initial_balance, interest_rate, withdraw_account, loan_term_months, is_io, io_term_months) {
        super(initial_balance);
        this.name = name;
        this.start_date = start_date;
        this.interest_rate = interest_rate;
        this.withdraw_account = withdraw_account;
        this.loan_term_months = loan_term_months;
        this.is_io = is_io;
        this.io_term_months = io_term_months;
        this.num_months = 0;
        //this.balance = initial_balance;
        //this.balance_history = [];

        console.log('Start balance: ' + this.balance);

        // Calculate the monthly repayments.
        if (is_io) {
            this.io_monthly_repayment = calculate_io_monthly_repayment(this.balance, this.interest_rate);
            this.pi_monthly_repayment = calculate_p_i_monthly_repayment(this.balance, this.interest_rate,
                                                                        this.loan_term_months - this.io_term_months);
        } else {
            this.io_monthly_repayment = null;
            this.pi_monthly_repayment = calculate_p_i_monthly_repayment(this.balance, this.interest_rate, this.loan_term_months);
        }
    }

    get_monthly_repayment() {
        let monthly_repayment;
        if (this.is_io && this.num_months < this.io_term_months) {
            // Switching from IO to P&I.
            monthly_repayment = this.io_monthly_repayment;

        } else {
            monthly_repayment = this.pi_monthly_repayment;
        }
        return monthly_repayment;
    }

    process_transactions(current_date) {
        //Process transactions at the end of the month.
        // First accrue interest incurred over the month.
        this.accrue_interest()

        console.log('Current date: ' + current_date);

        //this.balance = round(this.balance, 2)
        let balance = this.balance;//this.get_balance()
        //this.balance = round(this.balance, 2)
        console.log('Current balance: ' + balance);

        let monthly_repayment = this.get_monthly_repayment()
        console.log('Monthly repayment: ' + monthly_repayment);

        if (balance < 0) {
            // Deduct loan payment from loan account.
            // TODO: Should use max for negative numbers?
            let amount = Math.min(monthly_repayment, -balance)
            amount = this.withdraw_account.withdraw(amount)
            this.deposit(amount)
        }

        this.balance_history.push([current_date, this.balance])

        this.num_months += 1
    }

    accrue_interest() {
        let interest = compute_monthly_interest(this.balance, this.interest_rate, 0);
        console.log('Balance before accruing interest: ' + this.balance);
        console.log('Accruing interest: ' + interest);
        this.balance += interest
        //self.balance_history.append(self.balance)
    }

    // Move to Account base class.
    //deposit(amount) {
    //    this.balance += amount;
    //}
}