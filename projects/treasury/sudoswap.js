const { nullAddress, treasuryExports } = require("../helper/treasury");
const ADDRESSES = require('../helper/coreAssets.json')

const treasury = "0xb16c1342E617A5B6E4b631EB114483FDB289c0A4" //pair factor1 
const treasury2 = "0xA020d57aB0448Ef74115c112D18a9C231CC86000" //pair factor2
const treasury3 = "0x6853f8865BA8e9FBd9C8CCE3155ce5023fB7EEB0" //sudo governance
const SUDO = "0x3446Dd70B2D52A6Bf4a5a192D9b0A161295aB7F9"

module.exports = treasuryExports({
  ethereum: {
    owners: [treasury, treasury2, treasury3],
    ownTokens: [SUDO],
    tokens: [
      nullAddress,
      ADDRESSES.ethereum.WETH,
      ADDRESSES.ethereum.DAI,
      ADDRESSES.ethereum.USDC,
      ADDRESSES.ethereum.USDT,
      ADDRESSES.ethereum.FRAX,
      "0xb23d80f5FefcDDaa212212F028021B41DEd428CF", //PRIME
    ],
  },
});