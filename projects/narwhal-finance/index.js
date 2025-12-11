const {sumTokensExport} = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json');

module.exports = {
  hallmarks: [
    [1689034511, "Launch on Arbitrum & BSC"],
  ],
};

const config = {
  bsc: {
    owner: '0x71AF984f825C7BEf79cAEE5De14565ca8A29Fe93',
    tokens: [ADDRESSES.bsc.USDT,]
  },
  arbitrum: {
    owner: '0x14559479DC1041Ef6565f44028D454F423d2b9E6',
    tokens: [ADDRESSES.arbitrum.USDT,]
  },
  monad: {
    owner: '0xb412A5d72c203Df308624e435659c9F70b6960aA',
    tokens: [ADDRESSES.monad.USDC,]
  },
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: sumTokensExport(config[chain])
  }
})
