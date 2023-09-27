
import datetime
from dateutil.relativedelta import relativedelta
import matplotlib.pyplot as plt

from loan import Loan, Loan2
from investment import Savings
from income import IncomeSource

def select_loan_to_repay(loans, current_index):
    # Go through the loans starting at the given index, until we find one that has balance owing.
    index = current_index
    while True:
        if index is None or index >= len(loans):
            return None
        loan = loans[index]
        if loan.get_balance() < 0:
            return index
        index += 1

def plot(dates, values, title):
    fig, ax = plt.subplots()
    ax.plot(dates, values, '-o', label="Values")
    ax.set_title(title)
    ax.set_xlabel("Date")
    ax.set_ylabel("Value")
    ax.grid()
    ax.legend(loc='upper right')  # , shadow=True)


def main():
    start_date = datetime.date(2021, 6, 1)
    end_date = datetime.date(2045, 1, 1)
    month_delta = relativedelta(months=1)

    # TODO: Realistic savings and income sources.
    # TODO: Interest only period.
    # TODO: Offset account.
    # TODO: Ability to add property at later date (rather than at simulation start). Add rent at the same time.
    # TODO: Ability to change expenses, income, etc.
    # TODO: Consider calculating monthly investment funds using income, expenses, rent, etc. Basically income minus expenses, rather than specified values.

    savings_account = Savings(100000, 0.00, monthly_investment_funds=5000)
    paul_job = IncomeSource(3822 * 2, savings_account)
    renee_job = IncomeSource(2801 * 2, savings_account)
    sc_rent = IncomeSource(759 * 26 / 12, savings_account)
    p_rent = IncomeSource((1000 - 55) * 26 / 12, savings_account)
    ep_loan = Loan("Erskine Park", -105000, 0.0293, monthly_repayment=2000, withdraw_account=savings_account)
    sc_loan = Loan("St Clair", -228000, 0.0338, monthly_repayment=1080, withdraw_account=savings_account)
    p_loan = Loan("Parramatta", -266000, 0.0313, monthly_repayment=1189, withdraw_account=savings_account)
    new_loan = Loan("New", -720000, 0.034, monthly_repayment=3200, withdraw_account=savings_account)

    accounts = [paul_job, savings_account, ep_loan, sc_loan, p_loan, new_loan]
    #accounts = [paul_job, savings_account, new_loan]

    loans = [ep_loan, sc_loan, p_loan, new_loan]
    #loans = [new_loan]

    # Form a list of dates at which to process the accounts.
    process_dates = []
    current_date = start_date + month_delta
    while current_date <= end_date:
        process_dates.append(current_date)
        current_date += month_delta
    print(process_dates)

    # Iterate over months.
    current_loan_index = 0
    for process_date in process_dates:

        # Select the loan to repay.
        current_loan_index = select_loan_to_repay(loans, current_loan_index)
        loan_to_repay = loans[current_loan_index] if current_loan_index is not None else None
        savings_account.set_loan_to_repay(loan_to_repay)

        # Determine how much extra funds have available, from our repaid loans.
        repaid_loans = loans[:current_loan_index]
        savings_account.determine_extra_monthly_investment_funds(repaid_loans)

        for account in accounts:
            account.process_transactions()
        for account in accounts:
            account.accrue_interest()

    savings_balance_history = savings_account.get_balance_history()
    plot(process_dates, savings_balance_history, "Savings balance")

    for loan in loans:
        loan_balance_history = loan.get_balance_history()
        plot(process_dates, loan_balance_history, loan.get_name())

    plt.show()

def main_20221029():
    start_date = datetime.date(2022, 11, 1)
    end_date = datetime.date(2045, 1, 1)
    month_delta = relativedelta(months=1)

    # TODO: Realistic savings and income sources.
    # TODO: Interest only period.
    # TODO: Offset account.
    # TODO: Ability to add property at later date (rather than at simulation start). Add rent at the same time.
    # TODO: Ability to change expenses, income, etc.
    # TODO: Consider calculating monthly investment funds using income, expenses, rent, etc. Basically income minus expenses, rather than specified values.

    savings_account = Savings(100000, 0.00, monthly_investment_funds=5000)
    paul_job = IncomeSource(9000, savings_account)
    renee_job = IncomeSource(2850 * 26 / 12, savings_account)
    sc_rent = IncomeSource(450 * 52 / 12, savings_account)
    p_rent = IncomeSource(480 * 52 / 12, savings_account)
    m_rent = IncomeSource((280 + 300) * 52 / 12, savings_account)
    w_rent = IncomeSource((330) * 52 / 12, savings_account)
    ep_loan = Loan("Erskine Park", 0, 0.0439, monthly_repayment=2100, withdraw_account=savings_account)
    sc_loan = Loan("St Clair", -225450, 0.0469, monthly_repayment=1100, withdraw_account=savings_account)
    p_loan = Loan("Parramatta", -263500, 0.0469, monthly_repayment=1350, withdraw_account=savings_account)
    m_loan_1 = Loan("Morayfield", -468000, 0.0504, monthly_repayment=1800, withdraw_account=savings_account)
    m_loan_2 = Loan("Morayfield Equity", -165000, 0.0469, monthly_repayment=1025, withdraw_account=savings_account)
    w_loan_1 = Loan("Waterford", -448000, 0.0504, monthly_repayment=1834, withdraw_account=savings_account)
    w_loan_2 = Loan("Waterford Equity", -150000, 0.0504, monthly_repayment=850, withdraw_account=savings_account)

    accounts = [paul_job, savings_account, ep_loan, sc_loan, p_loan, m_loan_1, m_loan_2, w_loan_1, w_loan_2]
    #accounts = [paul_job, savings_account, new_loan]

    loans = [w_loan_2, w_loan_1, m_loan_1, ep_loan, sc_loan, p_loan, m_loan_2]
    #loans = [new_loan]

    # Form a list of dates at which to process the accounts.
    process_dates = []
    current_date = start_date + month_delta
    while current_date <= end_date:
        process_dates.append(current_date)
        current_date += month_delta
    print(process_dates)

    # Iterate over months.
    current_loan_index = 0
    for process_date in process_dates:

        # Select the loan to repay.
        current_loan_index = select_loan_to_repay(loans, current_loan_index)
        loan_to_repay = loans[current_loan_index] if current_loan_index is not None else None
        savings_account.set_loan_to_repay(loan_to_repay)

        # Determine how much extra funds have available, from our repaid loans.
        repaid_loans = loans[:current_loan_index]
        savings_account.determine_extra_monthly_investment_funds(repaid_loans)

        for account in accounts:
            account.process_transactions()
        for account in accounts:
            account.accrue_interest()

    savings_balance_history = savings_account.get_balance_history()
    plot(process_dates, savings_balance_history, "Savings balance")

    for loan in loans:
        loan_balance_history = loan.get_balance_history()
        plot(process_dates, loan_balance_history, loan.get_name())

    plt.show()


def main_savingsonly():
    start_date = datetime.date(2023, 1, 1)
    end_date = datetime.date(2024, 1, 1)
    month_delta = relativedelta(months=1)

    savings_account = Savings(100000, 0.0, monthly_investment_funds=0)
    paul_job = IncomeSource(9000, savings_account)
    loan = Loan("Loan", -500000, 0.05, monthly_repayment=9000, withdraw_account=savings_account)

    accounts = [paul_job, savings_account, loan]
    loans = [loan]

    # Form a list of dates at which to process the accounts.
    process_dates = [start_date]
    current_date = start_date + month_delta
    while current_date <= end_date:
        process_dates.append(current_date)
        current_date += month_delta
    print(process_dates)

    # Iterate over months.
    current_loan_index = 0
    for process_date in process_dates[1:]:

        # Select the loan to repay.
        current_loan_index = select_loan_to_repay(loans, current_loan_index)
        loan_to_repay = loans[current_loan_index] if current_loan_index is not None else None
        savings_account.set_loan_to_repay(loan_to_repay)

        # Determine how much extra funds have available, from our repaid loans.
        repaid_loans = loans[:current_loan_index]
        savings_account.determine_extra_monthly_investment_funds(repaid_loans)

        for account in accounts:
            account.process_transactions()
        for account in accounts:
            account.accrue_interest()

    savings_balance_history = savings_account.get_balance_history()
    print(savings_balance_history)
    plot(process_dates, savings_balance_history, "Savings balance")

    for loan in loans:
        loan_balance_history = loan.get_balance_history()
        plot(process_dates, loan_balance_history, loan.get_name())

    plt.show()



if __name__ == '__main__':
    #main()
    #main_20221029()
    main_savingsonly()
