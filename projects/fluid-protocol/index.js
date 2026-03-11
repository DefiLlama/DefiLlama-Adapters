const { sumTokens } = require("../helper/chain/fuel")

async function tvl(api) {
  const contractId = '0xb18340bfe68c0b3a4fbd3a3ae2c014be94c16569b7f360cf53efe1b7023e545e'

  return sumTokens({ api, owner: contractId })
}

module.exports = {
  fuel: { tvl },
  timetravel: false,
}
