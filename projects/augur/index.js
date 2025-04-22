const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');

const dai = ADDRESSES.ethereum.DAI
const universe = '0x49244bd018ca9fd1f06ecc07b9e9de773246e5aa'
const delegator = '0xd5524179cB7AE012f5B642C1D6D700Bbaa76B96b'

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ tokensAndOwners: [
      [dai, universe],
      [ADDRESSES.null, delegator]
    ]}),
  },
  hallmarks:[
    [1613091600, "Election market resolves"]
  ]
}
