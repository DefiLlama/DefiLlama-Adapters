const { get_account_tvl } = require("../helper/proton");

async function proton() {
  return await get_account_tvl();
}

module.exports = {
  methodology: `ProtonLoan TVL is sum of all lending deposits in Proton Loan smart contract.`,
  fetch: proton
}