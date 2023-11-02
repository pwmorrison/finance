
export default class Account {
    constructor(start_date, initial_balance){
        this.balance = initial_balance;
        this.balance_history = [];
        // TODO: Remove this negative. It's only there temporarily to display the graph.
        //this.balance_history.push([start_date, initial_balance]);
    }

    deposit(amount) {
        this.balance += amount
    }

    // Move to Account base class.
    withdraw(amount) {
        if (this.balance >= amount) {
            // The funds are available.
            this.balance -= amount;
            return amount;
        } else {
            // Not enough funds are available.
            amount = this.balance;
            this.balance = 0;
            return amount;
        }
    }

    get_balance() {
        return this.balance
    }

    process_transactions(current_date) {
        // Perform any monthly transactions required of this account.
        //pass
    }

    accrue_interest() {
        // Generate interest.
        //pass
    }

    get_balance_history() {
        return this.balance_history
    }

}