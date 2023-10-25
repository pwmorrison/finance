

export function compute_monthly_interest(amount, interest_rate, offset_amount) {
    // The interest charged for a given month, at the current amount.
    // TODO: Take care of the offset amount causing the balance to become zero. Handle negative amounts.
    let monthly_interest_rate = interest_rate / 12;
    let monthly_interest = (amount - offset_amount) * monthly_interest_rate;
    return monthly_interest;
}