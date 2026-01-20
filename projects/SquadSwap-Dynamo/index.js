const { stakings } = require("../helper/staking");
const { getUniTVL } = require('../helper/unknownTokens')


const config = {
  bsc: { factory: '0x918Adf1f2C03b244823Cd712E010B6e3CD653DbA', masterchefs: ['0x6316f6a2029532E7F088459987F50Ed4B122b82a', '0x87dd4bC5dbDdcB7734A5FE1e01359dCDa180200f'], token: '0x2d2567dec25c9795117228adc7fd58116d2e310c' }
}


module.exports = {
  methodology: "TVL is calculated from total liquidity of SquadSwap's active pools",
  misrepresentedTokens: true
}

Object.keys(config).forEach(chain => {
  const { factory, masterchefs, token, } = config[chain]
  module.exports[chain] = {
    tvl: getUniTVL({ factory, useDefaultCoreAssets: true, }),
    staking: token && stakings(masterchefs, token)
  }
})