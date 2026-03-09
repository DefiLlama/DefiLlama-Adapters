const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");
const { mergeExports } = require('../helper/utils');
const { sumTokens2 } = require('../helper/unwrapLPs')

const Treasury = "0x73eb240a06f0e0747c698a219462059be6aaccc8";

module.exports = mergeExports([treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.CVX,
        ADDRESSES.ethereum.WETH,
        ADDRESSES.ethereum.CRV,
        "0xaa0C3f5F7DFD688C6E646F66CD2a6B66ACdbE434",
        "0x7f50786A0b15723D741727882ee99a0BF34e3466",
        "0x0148CF564318272c2Bad048488F90dF4e3769f32",
        "0x9aE380F0272E2162340a5bB646c354271c0F5cFC"
     ],
    owners: [Treasury],
    ownTokens: ['0xe127ce638293fa123be79c25782a5652581db234'],
  },
}), {
  ethereum: {
    tvl: async (api) => {
      return sumTokens2({ api, owner: Treasury, tokens: ['0x39D78f11b246ea4A1f68573c3A5B64E83Cff2cAe', ADDRESSES.ethereum.vlCVX]})
    }
  }
}])