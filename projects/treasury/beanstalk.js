const ADDRESSES = require('../helper/coreAssets.json')
const { treasuryExports, nullAddress } = require("../helper/treasury");

const bean = "0xBEA0000029AD1c77D3d5D23Ba2D8893dB9d1Efab";
const sprout = "0xb7ab3f0667eFF5e2299d39C23Aa0C956e8982235";
const farms = "0x21DE18B6A8f78eDe6D16C50A167f6B222DC08DF7";
const tokens = [
  nullAddress,
  ADDRESSES.ethereum.SAFE,
  ADDRESSES.ethereum.USDC,
];

module.exports = treasuryExports({
  ethereum: {
    tokens,
    owners: [sprout, farms],
    ownTokens: [bean],
  },
});
