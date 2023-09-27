

def compute_monthly_interest(amount, interest_rate, offset_amount=0):
    """
    The interest charged for a given month, at the current amount.
    """
    # TODO: Take care of the offset amount causing the balance to become zero. Handle negative amounts.
    monthly_interest_rate = interest_rate / 12
    monthly_interest = (amount - offset_amount) * monthly_interest_rate
    return monthly_interest

class Account:
    def __init__(self, initial_balance):
        self.balance = initial_balance
        self.balance_history = [initial_balance]

    def deposit(self, amount):
        self.balance += amount

    def withdraw(self, amount):
        if self.balance >= amount:
            # The funds are available.
            self.balance -= amount
            return amount
        else:
            # Not enough funds are available.
            amount = self.balance
            self.balance = 0
            return amount

    def get_balance(self):
        return self.balance

    def process_transactions(self):
        # Perform any monthly transactions required of this account.
        pass

    def accrue_interest(self):
        # Generate interest.
        pass

    def get_balance_history(self):
        return self.balance_history