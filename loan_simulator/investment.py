
from account import Account, compute_monthly_interest


class Savings(Account):
    def __init__(self, initial_balance, interest_rate, monthly_investment_funds):
        Account.__init__(self, initial_balance)
        self.interest_rate = interest_rate
        self.monthly_investment_funds = monthly_investment_funds
        self.extra_monthly_investment_funds = 0
        self.loan_to_repay = None

    def set_loan_to_repay(self, loan):
        self.loan_to_repay = loan

    def determine_extra_monthly_investment_funds(self, repaid_loans):
        self.extra_monthly_investment_funds = sum(loan.get_monthly_repayment() for loan in repaid_loans)

    def process_transactions(self):
        # TODO: Pay expenses (or consider this as another Account that withdraws from here).
        # Make additional loan payments with our monthly investment funds.
        if self.loan_to_repay is not None:
            balance = self.loan_to_repay.get_balance()
            payment = self.monthly_investment_funds + self.extra_monthly_investment_funds
            if balance < 0:
                amount = min(payment, -balance)
                amount = self.withdraw(amount)
                self.loan_to_repay.deposit(amount)

    def accrue_interest(self):
        interest = compute_monthly_interest(self.balance, self.interest_rate)
        self.balance += interest
        self.balance_history.append(self.balance)