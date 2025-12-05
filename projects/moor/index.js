const { sumTokens } = require("../helper/chain/fuel")

async function tvl(api) {
  const contractId = '0xd7795099227cc0b9dc5872d29ca2b10691d9db6bd45853a6bb532e68dd166ce3'

  return sumTokens({ api, owner: contractId })
}

module.exports = {
  fuel: { tvl },
  timetravel: false,
}