const ADDRESSES = require('../helper/coreAssets.json')
const { compoundExports } = require('../helper/compound');
const { staking, sumTokensExport } = require('../helper/unknownTokens')

const chain = 'godwoken_v1'

const farms = [
  "0x8a01b508d8bF08eE5583743C9E1C8Ec45C22E303",
  "0x4bdEb91c2DA38F60bc03aB469B095300656FeAa1",
]

const LPfarms = [
  "0x1781c95EB104238DA6dfC66E2005b3Afc36BcFf9",
  "0x38254D980745027d0dB39f06f83c40BE37F03404",
  "0x355880E6b49931A7B8B950B3dc032eF19670B780",
]

const BRAINIAC = '0x6baefb2f6ecfb912eb0b5791a691c0af63ac6e85'
const BRAINIAC_CKB_LP = '0xaa0f41e50dbfd8247fb397b1fffea1fea9f4e6d4'

// params =  comptroller , chain , brCKB , CKB
module.exports = {
  [chain]: compoundExports("0x5c68BDBba7151c486faCB66dc39b891030e46725", "0x352d09567dE5A02415670723D09E006F623fE62e", ADDRESSES.godwoken_v1.pCKB)
}

module.exports[chain].staking = staking({ chain, useDefaultCoreAssets: true, owners: farms, tokens: [BRAINIAC], lps: [BRAINIAC_CKB_LP], })
module.exports[chain].pool2 = sumTokensExport({ chain, useDefaultCoreAssets: true, owners: LPfarms, tokens: [BRAINIAC_CKB_LP], })
