const ADDRESSES = require('../helper/coreAssets.json')
const { treasuryExports, nullAddress } = require("../helper/treasury");

const jpegd = "0xE80C0cd204D654CEbe8dd64A4857cAb6Be8345a3";
const multisig = "0x51C2cEF9efa48e08557A361B52DB34061c025a1B";
const donationEvent = "0x3b7157E5E732863170597790b4c005436572570F";
const usdcVault = "0xFD110cf7985f6B7cAb4dc97dF1932495cADa9d08";
const usdtVault = "0x152DE634FF2f0A6eCBd05cB591cD1eEaCd2900Ed";
const pethVault = "0x548cAB89eBF34509Ae562BC8cE8D5Cdb4F08c3AD";

module.exports = treasuryExports({
  ethereum: {
    tokens: [
      nullAddress,
      ADDRESSES.ethereum.USDC, // USDC
      ADDRESSES.ethereum.USDT, // USDT
      ADDRESSES.ethereum.WETH, // WETH
      ADDRESSES.ethereum.DAI, // DAI
      ADDRESSES.ethereum.TUSD, // TUSD
      "0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B", // CVX
      "0x853d955aCEf822Db058eb8505911ED77F175b99e", // FRAX
      ADDRESSES.ethereum.LINK, // LINK
      "0x62B9c7356A2Dc64a1969e19C23e4f579F9810Aa7", // cvxCRV
      "0x5aFE3855358E112B5647B952709E6165e1c1eEEe", // SAFE
    ],
    owners: [multisig, donationEvent, usdcVault, usdtVault, pethVault],
    ownTokens: [jpegd],
  },
});
