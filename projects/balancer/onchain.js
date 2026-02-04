const ADDRESSES = require('../helper/coreAssets.json')
const { onChainTvl } = require('../helper/balancer')
const { eulerTokens } = require('../helper/tokenMapping')

const blacklistedTokens = [
  "0xC011A72400E58ecD99Ee497CF89E3775d4bd732F",
  ADDRESSES.ethereum.sUSD_OLD,
  //self destructed
  "0x00f109f744B5C918b13d4e6a834887Eb7d651535", "0x645F7dd67479663EE7a42feFEC2E55A857cb1833", "0x4922a015c4407F87432B179bb209e125432E4a2A",
  "0xdA16D6F08F20249376d01a09FEBbAd395a246b2C", "0x9be4f6a2558f88A82b46947e3703528919CE6414", "0xa7fd7d83e2d63f093b71c5f3b84c27cff66a7802",
  "0xacfbe6979d58b55a681875fc9adad0da4a37a51b", "0xd6d9bc8e2b894b5c73833947abdb5031cc7a4894",

  ...eulerTokens
]

const V2_ADDRESS = '0xBA12222222228d8Ba445958a75a0704d566BF2C8'; // shared by all networks

const config = {
  ethereum: { fromBlock: 12272146, },
  polygon: { fromBlock: 15832990, },
  arbitrum: { fromBlock: 222832, },
  xdai: { fromBlock: 24821598, },
  polygon_zkevm: { fromBlock: 203079, },
  base: { fromBlock: 1196036, },
  avax: { fromBlock: 26386141, },
  mode: { fromBlock: 8110317, },
  fraxtal: { fromBlock: 4708596 }
}

module.exports = {};

Object.keys(config).forEach(chain => {
  const { fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: onChainTvl(V2_ADDRESS, fromBlock, { blacklistedTokens })
  }
})
