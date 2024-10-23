const { sumTokens } = require("../helper/chain/fuel")

async function tvl(api) {
  const usdcMarket = '0x657ab45a6eb98a4893a99fd104347179151e8b3828fd8f2a108cc09770d1ebae'
  return sumTokens({ api, owner: usdcMarket,  })
}

module.exports = {
  fuel: { tvl },
  timetravel: false,
}

