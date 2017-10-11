import math
import numpy as np
import matplotlib.pyplot as plt
plt.style.use('ggplot')

class LoanPI:
    def __init__(self, amount, period, interest_rate):
        self.initial_amount = amount
        self.period = period
        self.interest_rate = interest_rate
        self.monthly_payment = self.compute_monthly_payment(
            amount, period, interest_rate)

    def compute_monthly_payment(self, amount, period_years, interest_rate):
        """
        https://www.wikihow.com/Calculate-Loan-Payments.
        """
        monthly_interest_rate = interest_rate / 12
        num_payments = period_years * 12
        M = amount * (monthly_interest_rate / (1 - math.pow(1 + monthly_interest_rate, -num_payments)))
        return M

    def compute_monthly_interest(self, amount, interest_rate):
        """
        The interest charged for a given month, at the current amount.
        """
        monthly_interest_rate = interest_rate / 12
        monthly_interest = amount * monthly_interest_rate
        return monthly_interest

    def compute_interest_over_period(self):
        """
        Computes all the interest charges over the entire period.
        """
        num_payments = self.period * 12
        principal = self.initial_amount
        interest_charges = []
        for payment in range(num_payments):
            interest = self.compute_monthly_interest(principal, self.interest_rate)
            interest_charges.append(interest)
            principal_paid = self.monthly_payment - interest
            principal -= principal_paid
        return interest_charges

    def calculate_monthly_stats(self):
        num_payments = self.period * 12
        principal = self.initial_amount
        interest_charges = []
        monthly_principal = []
        monthly_amount_owing = []
        amount_owing = self.monthly_payment * num_payments
        for payment in range(num_payments):
            interest = self.compute_monthly_interest(principal, self.interest_rate)
            interest_charges.append(interest)

            monthly_principal.append(principal)
            principal_paid = self.monthly_payment - interest
            principal -= principal_paid

            monthly_amount_owing.append(amount_owing)
            amount_owing -= self.monthly_payment

        return monthly_principal, monthly_amount_owing

class LoanIO:
    def __init__(self):
        pass

def main():
    amount = 476000
    period = 25
    interest_rate = 0.0374
    loan = LoanPI(amount, period, interest_rate)

    print("Loan amount: $%.2f" % amount)
    print("Loan period: %d years" % period)
    print("Interest rate: %.2f%%" % (interest_rate * 100))
    print("Monthly loan payment: $%.2f" % loan.monthly_payment)

    monthly_principal, monthly_amount_owing = loan.calculate_monthly_stats()

    num_payments = period * 12
    x = range(num_payments)
    fig, ax = plt.subplots()
    ax.plot(x, np.divide(monthly_principal, 1000), label="Principal")
    ax.plot(x, np.divide(monthly_amount_owing, 1000), label="Amount owing")
    ax.set_xlabel("Month")
    ax.set_ylabel("Amount ($ thousands)")
    ax.legend(loc='upper right')#, shadow=True)
    plt.show()

if __name__ == '__main__':
    main()