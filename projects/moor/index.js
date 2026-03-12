const { sumTokens } = require("../helper/chain/fuel")

async function tvl(api) {
  const contractId = '0xd7795099227cc0b9dc5872d29ca2b10691d9db6bd45853a6bb532e68dd166ce3'
  const stakingContract = '0x79d2a26b57974e2b2e4d39dc189e818fcc86399337406dec65165b189a6f1ed7'

  return sumTokens({ api, owners: [contractId,stakingContract] })
}

module.exports = {
  fuel: { tvl },
  timetravel: false,
}
