const { toUSDTBalances } = require('../helper/balances');
const { blockQuery } = require('../helper/http')
const { getUniTVL } = require("../helper/unknownTokens")

const graphUrl = 'https://api.thegraph.com/subgraphs/name/zippoxer/sushiswap-subgraph-fork'
const graphQuery = `
query get_tvl($block: Int) {
  uniswapFactory(
    id: "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac",
    block: { number: $block }
  ) {
    totalVolumeUSD
    totalLiquidityUSD
  }
}
`;
const graphQueryPolygon = `
query get_tvl($block: Int) {
  factory(
    id: "0xc35dadb65012ec5796536bd9864ed8773abc74c4",
    block: { number: $block }
  ) {
    liquidityUSD
  }
}
`;

async function eth(timestamp, ethBlock, chainBlocks, { api }) {
  const { uniswapFactory } = await blockQuery(graphUrl, graphQuery, { api, });
  const usdTvl = Number(uniswapFactory.totalLiquidityUSD)

  return toUSDTBalances(usdTvl)
}

function getChainTVL() {
  return async (timestamp, _b, chainBlocks, { api }) => {
    const { factory } = await blockQuery('https://api.thegraph.com/subgraphs/name/sushiswap/exchange-' + api.chain, graphQueryPolygon, { api, });
    const usdTvl = Number(factory.liquidityUSD)

    return toUSDTBalances(usdTvl)
  }
}

const factory = '0xc35DADB65012eC5796536bD9864eD8773aBc74C4'
const tvl = getUniTVL({
  factory, useDefaultCoreAssets: true, blacklist: [
    '0xed0b4b0f0e2c17646682fc98ace09feb99af3ade', // RVRS
    '0x00598f74DA03489d4fFDb7Fde54db8E3D3AA9a61', // GSHIB
    '0xE38928cd467AD7347465048b3637893124187d02', // GSHIB
    '0xc0e39cbac6a5c5cdcdf2c1a1c29cbf5917754943', // GSHIB
  ],
})

module.exports = {
  telos: { tvl, },
  palm: { tvl, },
  moonriver: { tvl, },
  celo: { tvl, },
  okexchain: { tvl, },
  arbitrum: { tvl, },
  xdai: { tvl, },
  harmony: { tvl, },
  ethereum: { tvl: eth, },
  polygon: { tvl, },
  fantom: { tvl, },
  bsc: { tvl, },
  heco: { tvl, },
  boba: { tvl, },
  boba_avax: { tvl, },
  boba_bnb: { tvl, },
  avax: { tvl, },
  fuse: {
    tvl: getUniTVL({ factory: '0x43eA90e2b786728520e4f930d2A71a477BF2737C', useDefaultCoreAssets: true, }),
  },
  arbitrum_nova: { tvl, },
  //moved kava to trident adapter
  //kava: {  //  tvl: kavaTridentTvl,  //},
}

module.exports.polygon.tvl = getChainTVL('polygon')
// module.exports.bsc.tvl = getChainTVL('bsc')
// module.exports.fantom.tvl = getChainTVL('fantom')
// module.exports.harmony.tvl = getChainTVL('harmony')
