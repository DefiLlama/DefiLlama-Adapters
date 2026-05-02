const { stakingPriceLP } = require("../helper/staking");
const BBTC = '0xF5e11df1ebCf78b6b6D26E04FF19cD786a1e81dC'
const stakingLNNGAddress= '0x997A1C457acB020CF668BB7d6f05A184854CD3ca'
const LNNGLPAddress = '0x2d2011408d0E76c521Cf6169E004c8BF893Af34E'

async function tvl(api) {
  return api.sumTokens({owners: ['0x05407cAe9FdaF5e8cC395089207E2E72b8Ae739b'], tokens: [BBTC], api })
}

module.exports = {
  bouncebit: {
    tvl,
    staking: stakingPriceLP(stakingLNNGAddress, LNNGLPAddress, LNNGLPAddress)
  }
}