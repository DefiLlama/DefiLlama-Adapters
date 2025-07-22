const ADDRESSES = require('../helper/coreAssets.json')

const { pool2s } = require('../helper/pool2')
const { sumTokensExport } = require('../helper/sumTokens')

module.exports = {
  hallmarks: [
    [1675036800, "Winding down announced"]
  ],
  timetravel: false,
  ethereum: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        ['0xde7d85157d9714eadf595045cc12ca4a5f3e2adb', '0x062bf7b431dc9a3ab4062455e8d589df91748353'], // STPT
        ['0xf8c3527cc04340b208c854e985240c02f7b7793f', '0x6c64cded6BDD702a3BD9bB9e70C6d758fC358021'],  // FRONT
        // ['0x9aeB50f542050172359A0e1a25a9933Bc8c01259', '0xD539cb51D7662F93b2B2a2D1631b9C9e989b90ec'], // OIN
      ]
    }),
    pool2: pool2s(['0xae18cc5f00641563313422e5d61e608264012328', '0x37c3e8729b105b78013f47cb1a00584c7de90d1d',], ['0x54d16d35ca16163bc681f39ec170cf2614492517']),
  },
  harmony: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        [ADDRESSES.harmony.WONE, '0xD018669755ad1e8c10807836A4729DCDEE8f036d'], // WONE
        ['0xb6768223895acc78efba06c28fdd8940f95a8ec2', '0x014186Ea70568806c2eEFeeaa1D2A71c18B9B95a'], // VIPER-LP
      ]
    }),
  },
  near: {
    tvl: sumTokensExport({ owner: 'v3.oin_finance.near', })
  },
  deadFrom: 1675036800,
  methodology: "Counts TVL on multi-chain of OIN-Finance",
};
