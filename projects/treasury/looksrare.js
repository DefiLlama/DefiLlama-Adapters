const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xC8C57e4C73c71f72cA0a7e043E5D2D144F98ef13";
const looks = "0xf4d2888d29D722226FafA5d9B24F9164c092421E";

const tokens = [
  nullAddress,
  ADDRESSES.ethereum.USDC,
  ADDRESSES.ethereum.SAFE,
];
module.exports = treasuryExports({
  ethereum: {
    tokens,
    owners: [treasury],
    ownTokens: [looks],
  },
});
