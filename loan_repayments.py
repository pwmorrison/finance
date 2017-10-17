import math
import numpy as np
import matplotlib.pyplot as plt
plt.style.use('ggplot')

"""
https://www.moneysmart.gov.au/tools-and-resources/calculators-and-apps/interest-only-mortgage-calculator
"""

class Loan:
    def __init__(self, amount, period, interest_rate, interest_only_period=0, offset_amount=0):
        self.initial_amount = amount
        self.period = period
        self.interest_rate = interest_rate
        self.interest_only_period = interest_only_period
        self.offset_amount = offset_amount

        # Determine the monthly payments.
        self.monthly_payment_io = self.compute_monthly_payment_io(
            self.initial_amount, self.interest_rate, self.offset_amount)
        self.monthly_payment_pi = self.compute_monthly_payment_pi(
            self.initial_amount, period - interest_only_period, self.interest_rate)

    def compute_monthly_payment_io(self, amount, interest_rate, offset_amount):
        # Assume we are paying the IO portion at the start of the loan, when we owe
        # the entire amount.
        monthly_interest_rate = interest_rate / 12
        M = (amount - offset_amount) * monthly_interest_rate
        return M

    def compute_monthly_payment_pi(self, amount, period_years, interest_rate):
        """
        Compute the monthly payment during the P+I period.
        https://www.wikihow.com/Calculate-Loan-Payments.
        """
        monthly_interest_rate = interest_rate / 12
        num_payments = period_years * 12
        M = amount * (monthly_interest_rate / (1 - math.pow(1 + monthly_interest_rate, -num_payments)))
        return M

    def compute_monthly_interest(self, amount, interest_rate, offset_amount):
        """
        The interest charged for a given month, at the current amount.
        """
        monthly_interest_rate = interest_rate / 12
        monthly_interest = (amount - offset_amount) * monthly_interest_rate
        return monthly_interest

    def calculate_monthly_stats(self):
        num_io_payments = self.interest_only_period * 12
        num_pi_payments = (self.period - self.interest_only_period) * 12
        num_payments = self.period * 12

        principal = self.initial_amount
        monthly_interest_charges = []
        monthly_principal = []
        monthly_amount_owing = []
        amount_owing = self.monthly_payment_io * num_io_payments + \
                       self.monthly_payment_pi * num_pi_payments
        for payment in range(num_payments):
            interest = self.compute_monthly_interest(
                principal, self.interest_rate, self.offset_amount)
            monthly_interest_charges.append(interest)

            monthly_principal.append(principal)
            if payment < num_io_payments:
                principal_paid = 0
            else:
                principal_paid = self.monthly_payment_pi - interest
            principal -= principal_paid

            monthly_amount_owing.append(amount_owing)

            if payment < num_io_payments:
                amount_owing -= self.monthly_payment_io
            else:
                amount_owing -= self.monthly_payment_pi

            if principal <= 0:
                break

        return monthly_principal, monthly_amount_owing, monthly_interest_charges

def plot(period, monthly_principal, monthly_amount_owing):
    num_payments = len(monthly_principal)#period * 12
    x = list(range(num_payments))
    x = [val / 12 for val in x]
    fig, ax = plt.subplots()
    ax.plot(x, np.divide(monthly_principal, 1000), label="Principal")
    ax.plot(x, np.divide(monthly_amount_owing, 1000), label="Amount owing")
    ax.set_xlabel("Year")
    ax.set_ylabel("Amount ($ thousands)")
    ax.legend(loc='upper right')  # , shadow=True)
    plt.show()

def test_ep_loan():
    amount = 476000
    period = 25
    interest_rate = 0.0374
    interest_only_period = 5
    loan = Loan(amount, period, interest_rate, interest_only_period)

    print("Loan amount: $%.2f" % amount)
    print("Loan period: %d years" % period)
    print("Interest only period: %d years" % interest_only_period)
    print("Interest rate: %.2f%%" % (interest_rate * 100))
    print("Monthly loan payment (IO): $%.2f" % loan.monthly_payment_io)
    print("Monthly loan payment (PI): $%.2f" % loan.monthly_payment_pi)

    monthly_principal, monthly_amount_owing, monthly_interest_charges = \
        loan.calculate_monthly_stats()

    plot(period, monthly_principal, monthly_amount_owing)

def scenario_sc_io():
    # P+I EP loan at lower interest rate.
    ep_loan = Loan(476000, 25, 0.0374, 0)
    # IO SC loan at higher interest rate.
    sc_loan = Loan(237000, 25, 0.0483, 2)

    monthly_principal, monthly_amount_owing, monthly_interest_charges = \
        ep_loan.calculate_monthly_stats()
    ep_loan_total_interest = sum(monthly_interest_charges)
    print("Total interest paid on EP loan: %f" % ep_loan_total_interest)

def scenario_offset_vs_lower_interest():
    """
    Compares having an offset account, with no offset account but a lower interest
    rate. $10k of the offset account is kept as reserve, and the rest paid off the
    loan.
    """
    amount = 476000
    period = 25
    offset_amount = 100000
    # The EP loan, P+I, with a $100,000 offset account.
    offset_loan = Loan(amount, period, 0.042, 0, offset_amount)
    # The EP loan, P+I, with no offset account but paid off $90k.

    monthly_principal, monthly_amount_owing, monthly_interest_charges = \
        offset_loan.calculate_monthly_stats()

    plot(period, monthly_principal, monthly_amount_owing)

def main():
    # scenario_sc_io()
    scenario_offset_vs_lower_interest()

if __name__ == '__main__':
    main()