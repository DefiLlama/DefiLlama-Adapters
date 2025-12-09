const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xcAD001c30E96765aC90307669d578219D4fb1DCe";
const dao_treasury = "0xC7C5aFDB61e08BE3e2FB09098412b5706EB5c550";
const eul = "0xd9Fcd98c322942075A5C3860693e9f4f03AAE07b";

module.exports = treasuryExports({
  ethereum: {
    tokens: [
      ADDRESSES.ethereum.USDC, // USDC
      ADDRESSES.ethereum.USDT, // USDT
      "0xc944E90C64B2c07662A292be6244BDf05Cda44a7", // GRT
    ],
    owners: [treasury, dao_treasury],
    ownTokens: [eul],
  },
});
