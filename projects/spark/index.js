const { sumTokens } = require("../helper/chain/fuel")

async function tvl(api) {
  const contractId = '0xfe2c524ad8e088f33d232a45dbea43e792861640b71aa1814b30506bf8430ee5'
  return sumTokens({ api, owner: contractId,  })
}

module.exports = {
  fuel: { tvl },
  timetravel: false,
}