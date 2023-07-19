const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const communityFund = "0x586b9b2F8010b284A0197f392156f1A7Eb5e86e9";
const treasury = "0xfc64382c9ce89ba1c21692a68000366a35ff0336"
const nxm = "0xd7c49CEE7E9188cCa6AD8FF264C1DA2e69D4Cf3B";
const wNxm = "0x0d438F3b5175Bebc262bF23753C1E53d03432bDE";

module.exports = treasuryExports({
  ethereum: {
    tokens: [
      nullAddress,
      ADDRESSES.ethereum.USDT,
      "0x2ba592F78dB6436527729929AAf6c908497cB200", // CREAM
      ADDRESSES.ethereum.USDC,
      ADDRESSES.ethereum.SAFE,
    ],
    ownTokens: [nxm, wNxm],
    owners: [communityFund, treasury],
  },
});
