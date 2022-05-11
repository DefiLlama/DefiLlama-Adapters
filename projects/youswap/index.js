const { getUniTVL } = require('../helper/unknownTokens')
const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require('../helper/balances');
const sdk = require('@defillama/sdk')

const graphUrls = {
  ethereum: 'https://api.youswap.info/subgraphs/name/swap',
  heco: 'https://api.youswap.info/subgraphs/name/swap_heco',
  bsc: 'https://heco-api.youswap.com/subgraphs/name/swap_bsc'
}

const graphQuery = gql`
query get_tvl($block: Int) {
  uniswapFactories(
    block: { number: $block }
  ) {
    totalVolumeUSD
    totalLiquidityUSD
  }
}
`;

function chainTvl(chain) {
  return async (timestamp, ethBlock, chainBlocks) => {
    let block;
    if (chain === "ethereum") {
      block = ethBlock;
    }
    block = chainBlocks[chain]
    if (block === undefined) {
      block = (await sdk.api.util.lookupBlock(timestamp, { chain })).block
    }
    const { uniswapFactories } = await request(
      graphUrls[chain],
      graphQuery,
      {
        block,
      }
    );
    const usdTvl = Number(uniswapFactories[0].totalLiquidityUSD)

    return toUSDTBalances(usdTvl)
  }
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: getUniTVL({
      chain: 'ethereum',
      coreAssets: [
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // eth
        "0x6b175474e89094c44da98b954eedeac495271d0f", // DAI
        "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
        "0xdac17f958d2ee523a2206206994597c13d831ec7", // USDT
      ],
      factory: '0xa7028337d3da1f04d638cc3b4dd09411486b49ea',
    })
  },
  heco: {
    tvl: chainTvl('heco'),
  },
  bsc: {
    tvl: chainTvl('bsc'),
  },
}
