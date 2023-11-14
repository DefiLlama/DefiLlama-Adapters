const { toUSDTBalances } = require('../helper/balances');
const { blockQuery } = require('../helper/http')
const { getUniTVL } = require("../helper/unknownTokens")

const graphUrl = 'https://api.thegraph.com/subgraphs/name/aryzeofficial/aryze-polygon-v3'

const graphQueryPolygon = `
query get_tvl($block: Int) {
  factory(
    id: "0xE7aE959bbC94BDF2E9FF28a214840aB3285d7765",
    block: { number: $block }
  ) {
    totalValueLockedUSD
  }
}
`;

// async function eth(timestamp, ethBlock, chainBlocks, { api }) {
//   const { uniswapFactory } = await blockQuery(graphUrl, graphQuery, { api, });
//   const usdTvl = Number(uniswapFactory.totalLiquidityUSD)

//   return toUSDTBalances(usdTvl)
// }

function getChainTVL() {
  return async (timestamp, _b, chainBlocks, { api }) => {
    const { factory } = await blockQuery(graphUrl, graphQueryPolygon, { api, });
    const usdTvl = Number(factory.totalValueLockedUSD)
    return toUSDTBalances(usdTvl)
  }
}

// const factory = '0xc35DADB65012eC5796536bD9864eD8773aBc74C4'
// const tvl = getUniTVL({
//   factory, useDefaultCoreAssets: true, blacklist: [
//     '0xed0b4b0f0e2c17646682fc98ace09feb99af3ade', // RVRS
//     '0x00598f74DA03489d4fFDb7Fde54db8E3D3AA9a61', // GSHIB
//     '0xE38928cd467AD7347465048b3637893124187d02', // GSHIB
//     '0xc0e39cbac6a5c5cdcdf2c1a1c29cbf5917754943', // GSHIB
//   ],
// })

module.exports = {
  polygon: { tvl: getChainTVL('polygon'),},
}

// module.exports.polygon.tvl = getChainTVL('polygon')
// module.exports.bsc.tvl = getChainTVL('bsc')
// module.exports.fantom.tvl = getChainTVL('fantom')
// module.exports.harmony.tvl = getChainTVL('harmony')
