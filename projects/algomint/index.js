const goUsdBasketAddress = "SORHGFCFW4DMJRG33OBWQ5X5YQMRPHK3P5ITMBFMRCVNX74WAOOMLK32F4";
const { sumTokens, tokens } = require('../helper/chain/algorand')

async function tvl() {
  const balances = await sumTokens({ 
    owner: goUsdBasketAddress, 
    blacklistedTokens: [ tokens.goUsd, ],
    blacklistOnLpAsWell: true,
    tinymanLps: [ [tokens.usdcGoUsdLp,], ],
   })
  return balances
}

module.exports = {
  timetravel: false,
  algorand: {
    tvl
  }
}
