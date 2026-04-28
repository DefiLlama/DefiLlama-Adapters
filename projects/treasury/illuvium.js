const ADDRESSES = require('../helper/coreAssets.json')
const { treasuryExports, nullAddress } = require("../helper/treasury");

// illuvium:Fundraise treasury address
const Treasury = "0xBA085e0a14801C8c7A919a90304E75CabB7E3917";

module.exports = treasuryExports({
  arbitrum: {
    fetchCoValentTokens: false,
    tokens: [],
    owners: [Treasury],
  },
  ethereum: {
    fetchCoValentTokens: false,
    tokens: [
      nullAddress,
      ADDRESSES.ethereum.USDC,
      ADDRESSES.ethereum.USDT,
      ADDRESSES.ethereum.USDC,
      ADDRESSES.ethereum.SUSHI,
      ADDRESSES.ethereum.SAFE, 
    ],
    owners: [Treasury],
    ownTokens: ['0x767fe9edc9e0df98e07454847909b5e959d7ca0e'],
  }
})