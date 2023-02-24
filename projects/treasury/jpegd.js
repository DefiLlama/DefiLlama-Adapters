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
      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
      "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
      "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
      "0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI
      "0x0000000000085d4780B73119b644AE5ecd22b376", // TUSD
      "0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B", // CVX
      "0x853d955aCEf822Db058eb8505911ED77F175b99e", // FRAX
      "0x514910771AF9Ca656af840dff83E8264EcF986CA", // LINK
      "0x62B9c7356A2Dc64a1969e19C23e4f579F9810Aa7", // cvxCRV
      "0x5aFE3855358E112B5647B952709E6165e1c1eEEe", // SAFE
    ],
    owners: [multisig, donationEvent, usdcVault, usdtVault, pethVault],
    ownTokens: [jpegd],
  },
});
