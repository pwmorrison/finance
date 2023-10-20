
import datetime
from dateutil.relativedelta import relativedelta
import matplotlib.pyplot as plt

from account import Account, compute_monthly_interest


def calculate_p_i_monthly_repayment(balance, interest_rate, loan_term_months):
    # Calculate the P&I repayments needed to bring the loan to 0 at the expiry of the loan.
    # https://www.moneygeek.com/personal-loans/calculate-loan-payments/
    # P = a / {(1 + r)^n - 1} / [r(1 + r)^n]
    # P is your monthly loan payment
    # a is your principal
    # r is your periodic interest rate, which is your interest rate divided by 12
    # n is the total number of months in your loan term
    a = abs(balance)
    r = interest_rate / 12
    n = loan_term_months
    X = (1 + r) ** n - 1
    Y = r * (1 + r) ** n
    Z = X / Y
    P = a / Z
    return P

def calculate_io_monthly_repayment(balance, interest_rate):
    # Calculate IO monthly repayments.
    # https://www.moneygeek.com/personal-loans/calculate-loan-payments/
    a = abs(balance)
    r = interest_rate
    n = 12
    P = a * (r / n)
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
    def __init__(self, name, start_date, initial_balance, interest_rate, withdraw_account, loan_term_months, is_io, io_term_months):
        Account.__init__(self, initial_balance)
        self.name = name
        self.start_date = start_date
        self.interest_rate = interest_rate
        self.withdraw_account = withdraw_account
        self.loan_term_months = loan_term_months
        self.is_io = is_io
        self.io_term_months = io_term_months
        self.num_months = 0

        # Calculate the monthly repayments.
        if is_io:
            self.io_monthly_repayment = calculate_io_monthly_repayment(self.balance, self.interest_rate)
            self.pi_monthly_repayment = calculate_p_i_monthly_repayment(self.balance, self.interest_rate,
                                                                        self.loan_term_months - self.io_term_months)
        else:
            # Principal and interest.
            self.io_monthly_repayment = None
            self.pi_monthly_repayment = calculate_p_i_monthly_repayment(self.balance, self.interest_rate, self.loan_term_months)

        #self.monthly_repayment = monthly_repayment

        self.balance_history = [(start_date, initial_balance)]

    def get_name(self):
        return self.name

    def get_monthly_repayment(self):
        if self.is_io and self.num_months < self.io_term_months:
            # Switching from IO to P&I.
            monthly_repayment = self.io_monthly_repayment
        else:
            monthly_repayment = self.pi_monthly_repayment
        return monthly_repayment

    def process_transactions(self, current_date):
        """Process transactions at the end of the month.
        """
        # First accrue interest incurred over the month.
        self.accrue_interest()

        self.balance = round(self.balance, 2)
        balance = self.get_balance()
        self.balance = round(self.balance, 2)

        monthly_repayment = self.get_monthly_repayment()

        if balance < 0:
            # Deduct loan payment from loan account.
            # TODO: Should use max for negative numbers?
            amount = min(monthly_repayment, -balance)
            amount = self.withdraw_account.withdraw(amount)
            self.deposit(amount)

        self.balance_history.append((current_date, self.balance))

        self.num_months += 1

    def accrue_interest(self):
        interest = compute_monthly_interest(self.balance, self.interest_rate)
        self.balance += interest
        #self.balance_history.append(self.balance)


def test_loan2():
    from investment import Savings

    # Run until the loan is repayed.
    start_date = datetime.date(2000, 1, 1)
    month_delta = relativedelta(months=1)

    if 0:
        # https://www.moneygeek.com/personal-loans/calculate-loan-payments/#calculating-amortizing-loans
        # Should be about -566
        savings_account = Savings(100000, 0.0, monthly_investment_funds=0)
        loan = Loan2("Loan", start_date, -30000, 0.05, withdraw_account=savings_account, loan_term_months=5 * 12,
                     is_io=False, io_term=5 * 12)
        print(loan.monthly_repayment)

    if 1:
        savings_account = Savings(100000000, 0.0, monthly_investment_funds=0)
        if 0:
            # P&I loan.
            loan = Loan2("Loan", start_date, -500000, 0.05, withdraw_account=savings_account, loan_term_months=10*12,
                         is_io=False, io_term_months=10*12)
        else:
            # IO loan.
            loan = Loan2("Loan", start_date, -500000, 0.05, withdraw_account=savings_account, loan_term_months=10 * 12,
                         is_io=True, io_term_months=1 * 12)
        accounts = [savings_account, loan]

        print(f'Loan monthly repayment: {loan.get_monthly_repayment()}')

        current_date = start_date
        print(current_date, loan.balance)
        while (True):

            current_date += month_delta

            # for account in accounts:
            #    account.accrue_interest()
            for account in accounts:
                account.process_transactions(current_date)

            print(current_date, loan.balance)

            if loan.get_balance() == 0:
                break


        loan_balance_history = loan.get_balance_history()

        dates = [b[0] for b in loan_balance_history]
        values = [b[1] for b in loan_balance_history]

        fig, ax = plt.subplots()
        ax.plot(dates, values, '-o', label="Values")
        ax.set_title("Loan balance")
        ax.set_xlabel("Date")
        ax.set_ylabel("Value")
        ax.grid()
        ax.legend(loc='upper right')  # , shadow=True)

        plt.show()

if __name__ == '__main__':
    test_loan2()
