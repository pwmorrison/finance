
from account import Account


class IncomeSource(Account):
    def __init__(self, monthly_income, dest_account):
        Account.__init__(self, 0)
        self.monthly_income = monthly_income
        self.dest_account = dest_account

    def process_transactions(self):
        self.dest_account.deposit(self.monthly_income)

    def accrue_interest(self):
        pass