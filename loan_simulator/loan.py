
from account import Account, compute_monthly_interest


def calculate_p_i_monthly_repayment(balance, interest_rate, loan_term_months):
    # Calculate the P&I repayments needed to bring the loan to 0 at the expiry of the loan.
    # https://www.moneygeek.com/personal-loans/calculate-loan-payments/
    # P = a / {(1 + r)^n - 1} / [r(1 + r)^n]
    # P is your monthly loan payment
    # a is your principal
    # r is your periodic interest rate, which is your interest rate divided by 12
    # n is the total number of months in your loan term
    a = balance
    r = interest_rate / 12
    n = loan_term_months
    X = (1 + r) ** n - 1
    Y = r * (1 + r) ** n
    Z = X / Y
    P = a / Z
    return P


class Loan(Account):
    def __init__(self, name, initial_balance, interest_rate, monthly_repayment, withdraw_account):
        Account.__init__(self, initial_balance)
        self.name = name
        self.interest_rate = interest_rate
        self.monthly_repayment = monthly_repayment
        self.withdraw_account = withdraw_account
        self.balance_history = [initial_balance]

    def get_name(self):
        return self.name

    def get_monthly_repayment(self):
        return self.monthly_repayment

    def process_transactions(self):
        balance = self.get_balance()
        if balance < 0:
            # Deduct loan payment from loan account.
            amount = min(self.monthly_repayment, -balance)
            amount = self.withdraw_account.withdraw(amount)
            self.deposit(amount)

    def accrue_interest(self):
        interest = compute_monthly_interest(self.balance, self.interest_rate)
        self.balance += interest
        self.balance_history.append(self.balance)


class Loan2(Account):
    """Version of Loan that automatically calculate the loan repayments.
    """

    # TODO:
    def __init__(self, name, initial_balance, interest_rate, withdraw_account, loan_term_months, is_io, io_term):
        Account.__init__(self, initial_balance)
        self.name = name
        self.interest_rate = interest_rate
        self.withdraw_account = withdraw_account
        self.loan_term_months = loan_term_months
        self.is_io = is_io
        self.io_term = io_term

        # Calculate the monthly repayments.
        if is_io:
            pass
        else:
            # Principal and interest.
            self.monthly_repayment = calculate_p_i_monthly_repayment(self.balance, self.interest_rate, self.loan_term_months)

        #self.monthly_repayment = monthly_repayment

        self.balance_history = [initial_balance]

    def get_name(self):
        return self.name

    def get_monthly_repayment(self):
        return self.monthly_repayment

    def process_transactions(self):
        balance = self.get_balance()
        if balance < 0:
            # Deduct loan payment from loan account.
            amount = min(self.monthly_repayment, -balance)
            amount = self.withdraw_account.withdraw(amount)
            self.deposit(amount)

    def accrue_interest(self):
        interest = compute_monthly_interest(self.balance, self.interest_rate)
        self.balance += interest
        self.balance_history.append(self.balance)


def test_loan2():
    from investment import Savings

    if 0:
        # https://www.moneygeek.com/personal-loans/calculate-loan-payments/#calculating-amortizing-loans
        # Should be about -566
        savings_account = Savings(100000, 0.0, monthly_investment_funds=0)
        loan = Loan2("Loan", -30000, 0.05, withdraw_account=savings_account, loan_term_months=5 * 12,
                     is_io=False, io_term=5 * 12)
        print(loan.monthly_repayment)

    if 1:
        savings_account = Savings(100000, 0.0, monthly_investment_funds=0)
        loan = Loan2("Loan", -500000, 0.05, withdraw_account=savings_account, loan_term_months=10*12,
                     is_io=False, io_term=10*12)
        print(loan.monthly_repayment)


if __name__ == '__main__':
    test_loan2()
