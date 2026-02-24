const { nullAddress, treasuryExports } = require("../helper/treasury");
const ADDRESSES = require('../helper/coreAssets.json');

const treasury = "0x0b26C05866e6353E46f4A7e2d10Cb42d4B583E57"
const treasury2 = "0x353657ACd92f4C83a9DbA7Cdab84289EffFA4FeB"
const treasury3 = "0xd6BcA7F5F7f1Be0494DcD2Da16381176DA425131"
const lineaTreasuries = ["0x5e3b62E38808Fc9582C23bC05E8a19A091D979c9", "0x0323500C3F2e29F7B7f42f83d7646A5B3D0591b1"]

module.exports = treasuryExports({
  ethereum: {
    tokens: [
      nullAddress,
      '0x8c1BEd5b9a0928467c9B1341Da1D7BD5e10b6549', // LsETH
    ],
    owners: [treasury, treasury2, treasury3],
  },
  linea: {
    tokens: [
      "0x1Bf74C010E6320bab11e2e5A532b5AC15e0b8aA6" // weETH,
    ],
    owners: lineaTreasuries
  }
});
