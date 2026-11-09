const { getChainTvl } = require('../helper/getUniSubgraphTvl');
const { getUniTVL } = require('../helper/unknownTokens');

const v2graph = getChainTvl({
  ethereum: 'GmSczqdCDZ3hJeYY9JphwsADn5rePUzUKm8EZcVuhRAm',
  base: 'DbcUmZwXBYbNZvLuDEvcmFa4uAWwwjrdX8dVFg1AUVKa',
})

module.exports = {
  misrepresentedTokens: true,
  methodology: `Counts the tokens locked on AMM pools. Ethereum and Base use the Uniswap V2 subgraphs, other chains read pool reserves on-chain`,
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
  zora: '0x0F797dC7efaEA995bB916f268D919d0a1950eE3C',
  unichain: '0x1F98400000000000000000000000000000000002',
  monad: '0x182a927119d56008d921126764bf884221b10f59',
  xlayer: '0xdf38f24fe153761634be942f9d859f3dba857e95',
  tempo: '0xf9ec577a4e45b5278bb7cf60fcbc20c3acaef68f',
  robinhood: '0x8bcEaA40B9AcdfAedF85AdF4FF01F5Ad6517937f',
  ink: '0xfe57a6ba1951f69ae2ed4abe23e0f095df500c04',
  arc: '0x89e5db8b5aa49aa85ac63f691524311aeb649eba',
  wc: '0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f',
  elysium: '0xBbBcC62853a5fA27b93d6Bab3E6F7ce841E25Df2',
}

Object.keys(config).forEach(chain => {
  const factory = config[chain]
  module.exports[chain] = {
    tvl: getUniTVL({ factory, useDefaultCoreAssets: true, permitFailure: true })
  }
})

module.exports.isHeavyProtocol = true

const graphChains = ['ethereum', 'base']

graphChains.forEach(chain => {
  module.exports[chain] = { tvl: v2graph(chain) }
})
