const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xfc78f8e1Af80A3bF5A1783BB59eD2d1b10f78cA9";

module.exports = treasuryExports({
  ethereum: {
    owner: [treasury],
    ownTokens: [
      "0xC0c293ce456fF0ED870ADd98a0828Dd4d2903DBF", // AURA
      "0xc29562b045D80fD77c69Bec09541F5c16fe20d9d", // B-80AURA-20WETH
      "0x0Bf1f1E3ccf6A1089710359E312753b44BBF85f8", // sAURA
    ],
    tokens: [
      nullAddress,
      ADDRESSES.ethereum.USDC,
      ADDRESSES.ethereum.WETH,
      "0xba100000625a3754423978a60c9317c58a424e3D", // BAL
      ADDRESSES.ethereum.SAFE,
      "0x0d02755a5700414B26FF040e1dE35D337DF56218", // BEND
      "0x616e8BfA43F920657B3497DBf40D6b1A02D4608d", // auraBAL
      "0x3dd0843A028C86e0b760b1A76929d1C5Ef93a2dd", // B-auraBAL-STABLE
    ],
  },
});
