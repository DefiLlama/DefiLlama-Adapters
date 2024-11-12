const { sumTokens } = require("../helper/chain/fuel")

async function tvl(api) {
  const contractId = '0x7fca28897ed946740225f3091e20c64e0b2cac57931e90e477e39ed2622785f7'
  // let sumTotals = await sumTokens({ api, owner: contractId })
  // console.log(sumTotals)
  return sumTokens({ api, owner: contractId })
}

module.exports = {
  fuel: { tvl },
  timetravel: false,
}
