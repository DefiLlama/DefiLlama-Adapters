const { get_account_tvl } = require("../helper/proton");

async function proton() {
  return await get_account_tvl();
}

module.exports = {
  methodology: `ProtonLoan TVL is achieved by querying token balances from Proton Loan smart contract.`,
  fetch: proton
}