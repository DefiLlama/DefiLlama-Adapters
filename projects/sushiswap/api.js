const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require('../helper/balances');
const { getBlock } = require('../helper/getBlock')
const { getUniTVL } = require("../helper/unknownTokens")
const { sumTokens2 } = require('../helper/unwrapLPs')
const sdk = require('@defillama/sdk');
const { getChainTransform } = require("../helper/portedTokens");

const graphUrl = 'https://api.thegraph.com/subgraphs/name/zippoxer/sushiswap-subgraph-fork'
const graphQuery = gql`
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
const graphQueryPolygon = gql`
query get_tvl($block: Int) {
  factory(
    id: "0xc35dadb65012ec5796536bd9864ed8773abc74c4",
    block: { number: $block }
  ) {
    liquidityUSD
  }
}
`;

async function eth(timestamp, ethBlock, chainBlocks) {
  let block = ethBlock
  if (block === undefined) {
    block = await getBlock(timestamp, 'ethereum', chainBlocks)
  }
  const { uniswapFactory } = await request(
    graphUrl,
    graphQuery,
    {
      block: block - 50,
    }
  );
  const usdTvl = Number(uniswapFactory.totalLiquidityUSD)

  return toUSDTBalances(usdTvl)
}

function getChainTVL(chain) {
  return async (timestamp, _b, chainBlocks) => {
    const block = await getBlock(timestamp, chain, chainBlocks, false)
    const { factory } = await request(
      'https://api.thegraph.com/subgraphs/name/sushiswap/exchange-' + chain,
      graphQueryPolygon,
      {
        block: block - 100,
      }
    );
    const usdTvl = Number(factory.liquidityUSD)

    return toUSDTBalances(usdTvl)
  }
}

const factory = '0xc35DADB65012eC5796536bD9864eD8773aBc74C4'

module.exports = {
  telos: {
    tvl: getUniTVL({
      factory,
      chain: 'telos',
      useDefaultCoreAssets: true,
    }),
  },
  palm: {
    tvl: getUniTVL({
      factory,
      chain: 'palm',
      useDefaultCoreAssets: true,
    }),
  },
  moonriver: {
    tvl: getUniTVL({
      factory,
      chain: 'moonriver',
      useDefaultCoreAssets: true,
    }),
  },
  celo: {
    tvl: getUniTVL({
      factory,
      chain: 'celo',
      useDefaultCoreAssets: true,
    }),
  },
  okexchain: {
    tvl: getUniTVL({
      factory,
      chain: 'okexchain',
      useDefaultCoreAssets: true,
    }),
  },
  arbitrum: {
    tvl: getUniTVL({
      factory,
      chain: 'arbitrum',
      useDefaultCoreAssets: true,
    }),
  },
  xdai: {
    tvl: getUniTVL({
      factory,
      chain: 'xdai',
      useDefaultCoreAssets: true,
    })
  },
  harmony: {
    tvl: getUniTVL({
      factory,
      chain: 'harmony',
      useDefaultCoreAssets: true,
      blacklist: [
        '0xed0b4b0f0e2c17646682fc98ace09feb99af3ade', // RVRS
      ],
    })
  },
  ethereum: {
    tvl: eth,
  },
  polygon: {
    tvl: getUniTVL({
      factory,
      chain: 'polygon',
      useDefaultCoreAssets: true,
    }),
  },
  fantom: {
    tvl: getUniTVL({
      factory,
      chain: 'fantom',
      useDefaultCoreAssets: true,
    }),
  },
  bsc: {
    tvl: getUniTVL({
      factory,
      chain: 'bsc',
      useDefaultCoreAssets: true,
      blacklist: [
        '0x00598f74DA03489d4fFDb7Fde54db8E3D3AA9a61', // GSHIB
        '0xE38928cd467AD7347465048b3637893124187d02', // GSHIB
        '0xc0e39cbac6a5c5cdcdf2c1a1c29cbf5917754943', // GSHIB
      ]
    }),
  },
  heco: {
    tvl: getUniTVL({
      factory,
      chain: 'heco',
      useDefaultCoreAssets: true,
    }),
  },
  boba: {
    tvl: getUniTVL({
      factory,
      chain: 'boba',
      useDefaultCoreAssets: true,
    }),
  },
  avax: {
    tvl: getUniTVL({
      factory,
      chain: 'avax',
      useDefaultCoreAssets: true,
    }),
  },
  fuse: {
    tvl: getUniTVL({
      factory: '0x43eA90e2b786728520e4f930d2A71a477BF2737C',
      chain: 'fuse',
      useDefaultCoreAssets: true,
    }),
  },
  arbitrum_nova: {
    tvl: getUniTVL({
      chain: 'arbitrum_nova',
      useDefaultCoreAssets: true,
      factory,
    })
  },
  //moved kava to trident adapter
  //kava: {
  //  tvl: kavaTridentTvl,
  //},
}

module.exports.polygon.tvl = getChainTVL('polygon')
// module.exports.bsc.tvl = getChainTVL('bsc')
module.exports.fantom.tvl = getChainTVL('fantom')
module.exports.harmony.tvl = getChainTVL('harmony')

async function kavaTridentTvl(ts, _b, cb) {
  const chain = 'kava'
  const graph = 'https://pvt.graph.kava.io/subgraphs/name/sushiswap/trident-kava'
  const query = `query get_tvl($block: Int){
      pairs(
        block: { number: $block }
        size: 1000
      ){
        id
        name
        type
        reserve0
        reserve1
        token0 {
          id
        }
        token1 {
          id
        }
      }
  }`
  const block = await getBlock(ts, chain, cb, false)
  const { pairs } = await request(graph, query, {
    block: block - 100,
  })
  // const bentoBox = '0xc35DADB65012eC5796536bD9864eD8773aBc74C4'
  const balances = {}
  const transform = await getChainTransform(chain)
  pairs.forEach(i => {
    sdk.util.sumSingleBalance(balances, transform(i.token0.id), i.reserve0)
    sdk.util.sumSingleBalance(balances, transform(i.token1.id), i.reserve1)
  } )
  return balances
}
