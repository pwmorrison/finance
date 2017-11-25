import matplotlib.pyplot as plt
plt.style.use('ggplot')

"""
Calculate the savings to be had by using a credit card, and paying it off each 
month, vs. paying for everything out of the bank account.
The common wisdom is the credit card is better, because the money stays in your
bank account earning interest.
"""


class CreditCard:
    """
    https://www.nab.com.au/personal/learn/managing-your-debts/interest-free-periods
    """

    def __init__(self, statement_period=30, interest_free_period=55):
        self.statement_period = statement_period
        self.interest_free_period = interest_free_period
        self.balance = 0
        # The amount that we've already returned, to be paid.
        self.amount_owing = 0

    def make_purchases(self, amount):
        self.balance += amount

    def new_month(self):
        # Return the amount and when to pay it.
        amount_to_pay = self.balance - self.amount_owing
        self.amount_owing += amount_to_pay
        return amount_to_pay, self.get_due_date()

    def get_balance(self):
        return self.balance

    def pay_amount(self, amount):
        self.balance -= amount
        self.amount_owing -= amount

    def get_due_date(self):
        return max(self.interest_free_period - self.statement_period, 0)


def simulate_period(
        initial_bank_account_balance, timeframe, days_per_month, pay, costs,
        credit_card, interest_rate):
    """
    Simulates the given period.
    """
    costs_per_day = costs / days_per_month
    bank_account = initial_bank_account_balance
    bank_account_history = []
    credit_card_history = []
    pending_cc_payments = []
    for month in range(timeframe):
        # # Earn interest on the current account balance.
        # interest = (interest_rate / 12) * bank_account
        # bank_account += interest
        # Get paid, assuming we get paid at the start of the month.
        bank_account += pay
        if credit_card is not None:
            cc_next_pay_amount, cc_next_pay_day = credit_card.new_month()
            pending_cc_payments.append([cc_next_pay_amount, cc_next_pay_day])

        for day in range(days_per_month):
            # Earn interest on the current account balance.
            interest = (interest_rate / 365) * bank_account
            bank_account += interest

            # Pay bills etc.
            if credit_card is not None:
                # Use the credit card.
                credit_card.make_purchases(costs_per_day)
            else:
                # Pay straight from the bank account.
                bank_account -= costs_per_day

            # Pay the credit card if its due.
            if credit_card:
                # Pay each of the due credit card payments.
                for i, pending_cc_payment in enumerate(pending_cc_payments):
                    if pending_cc_payment[1] == 0:
                        # This payment is due.
                        amount_due = pending_cc_payment[0]
                        bank_account -= amount_due
                        credit_card.pay_amount(amount_due)
                        print(month, day, amount_due)
                        pending_cc_payments.remove(pending_cc_payment)
                    else:
                        # We're 1 day closer to the due date.
                        pending_cc_payment[1] -= 1

            bank_account_history.append(bank_account)
            if credit_card is not None:
                credit_card_history.append(credit_card.get_balance())

    if credit_card is not None:
        # Make the final payment.
        balance = credit_card.get_balance()
        bank_account -= balance
        credit_card.pay_amount(balance)
        bank_account_history.append(bank_account)
        credit_card_history.append(credit_card.get_balance())
    else:
        # Make a corresponding entry, so the history lengths are equal
        # (for plotting).
        bank_account_history.append(bank_account_history[-1])

    return bank_account_history, credit_card_history


def main():
    """
    On the credit card, we pay it off in full when due.
    """
    initial_bank_account_balance = 10000
    timeframe = 6  # months
    days_per_month = 30  # simplifying assumption
    pay = 5000  # per month
    costs = 4000  # per month
    interest_rate = 0.04  # 4%, currently common for home loans.
    interest_free_period = 60

    # Without credit card.
    bank_account_history, _ = simulate_period(
        initial_bank_account_balance, timeframe, days_per_month, pay, costs,
        None, interest_rate)
    print("Final bank account balance without credit card: %.2f" %
          bank_account_history[-1])

    print(len(bank_account_history), bank_account_history)

    # With credit card.
    credit_card = CreditCard(days_per_month, interest_free_period)
    bank_account_history_cc, credit_card_history_cc = simulate_period(
        initial_bank_account_balance, timeframe, days_per_month, pay, costs,
        credit_card, interest_rate)
    print("Final bank account balance with credit card: %.2f" %
          bank_account_history_cc[-1])

    print(len(bank_account_history_cc), bank_account_history_cc)
    print("Credit card history", len(credit_card_history_cc), credit_card_history_cc)

    # Plot the bank account balances.
    fig, ax = plt.subplots()
    x = range(len(bank_account_history))
    ax.plot(x, bank_account_history, label="Bank account without CC")
    ax.plot(x, bank_account_history_cc, label="Bank account with CC")
    ax.set_title("Initial bank balance $%.2f, timeframe %d months, \npay \$%.2f pm, costs \$%.2f pm, bank interest rate %.2f%%" %
                 (initial_bank_account_balance, timeframe, pay, costs, interest_rate*100))
    ax.set_xlabel("Day")
    ax.set_ylabel("Amount")
    ax.legend(loc='lower right')

    # Plot the credit card balances.
    fig, ax = plt.subplots()
    x = range(len(credit_card_history_cc))
    ax.plot(x, credit_card_history_cc, label="CC history")
    ax.set_title("Credit card balance")
    ax.set_xlabel("Day")
    ax.set_ylabel("Amount")
    # ax.legend(loc='lower right')

    plt.show()

if __name__ == "__main__":
    main()
