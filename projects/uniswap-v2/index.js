const { getChainTvl } = require('../helper/getUniSubgraphTvl');
const { getUniTVL } = require('../helper/unknownTokens');

const v2graph = getChainTvl({
  ethereum: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v2-dev'
})

module.exports = {
  misrepresentedTokens: true,
  methodology: `Counts the tokens locked on AMM pools, pulling the data from the 'ianlapham/uniswapv2' subgraph`,
  ethereum: {
    tvl: v2graph('ethereum'),
  },
}

const config = {
  // ethereum: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
  optimism: '0x0c3c1c532F1e39EdF36BE9Fe0bE1410313E074Bf',
  arbitrum: '0xf1D7CC64Fb4452F05c498126312eBE29f30Fbcf9',
  avax: '0x9e5A52f57b3038F1B8EeE45F28b3C1967e22799C',
  base: '0x8909dc15e40173ff4699343b6eb8132c65e18ec6',
  bsc: '0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6',
  polygon: '0x9e5A52f57b3038F1B8EeE45F28b3C1967e22799C',
  celo: '0x79a530c8e2fA8748B7B40dd3629C0520c2cCf03f',
  zora: '0x0F797dC7efaEA995bB916f268D919d0a1950eE3C'
}

Object.keys(config).forEach(chain => {
  const factory = config[chain]
  module.exports[chain] = {
    tvl: getUniTVL({ factory, useDefaultCoreAssets: true, })
  }
})
