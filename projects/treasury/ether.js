const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasuryOP = "0x8ba1f109551bD432803012645Ac136ddd64DBA72";
const treasuryETH = "0x8ba1f109551bD432803012645Ac136ddd64DBA72"

module.exports = treasuryExports({
  optimism: {
    tokens: [
    nullAddress,
      ADDRESSES.optimism.USDC, // USDC
      ADDRESSES.optimism.OP
    ],
    owners: [treasuryOP],
  },
  ethereum: {
    tokens: [
    nullAddress,
      ADDRESSES.ethereum.USDC, // USDC
      ADDRESSES.ethereum.TUSD,
      ADDRESSES.ethereum.DAI,
      ADDRESSES.ethereum.USDT
    ],
    owners: [treasuryETH],
  },
});