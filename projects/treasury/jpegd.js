const ADDRESSES = require('../helper/coreAssets.json')
const { treasuryExports, nullAddress } = require("../helper/treasury");

const jpegd = "0xE80C0cd204D654CEbe8dd64A4857cAb6Be8345a3";
const multisig = "0x51C2cEF9efa48e08557A361B52DB34061c025a1B";
const donationEvent = "0x3b7157E5E732863170597790b4c005436572570F";
const usdcVault = "0xFD110cf7985f6B7cAb4dc97dF1932495cADa9d08";
const usdtVault = "0x152DE634FF2f0A6eCBd05cB591cD1eEaCd2900Ed";
const pethVault = "0x548cAB89eBF34509Ae562BC8cE8D5Cdb4F08c3AD";
const lp = "0xdB06a76733528761Eda47d356647297bC35a98BD"
const lp2 = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88"

module.exports = treasuryExports({
  ethereum: {
    tokens: [
      nullAddress,
      ADDRESSES.ethereum.USDC,
      ADDRESSES.ethereum.USDT,
      ADDRESSES.ethereum.WETH,
      ADDRESSES.ethereum.DAI,
      ADDRESSES.ethereum.TUSD,
      ADDRESSES.ethereum.CVX,
      "0x853d955aCEf822Db058eb8505911ED77F175b99e", // FRAX
      ADDRESSES.ethereum.LINK,
      "0x62B9c7356A2Dc64a1969e19C23e4f579F9810Aa7", // cvxCRV
      "0x5aFE3855358E112B5647B952709E6165e1c1eEEe", // SAFE
      "0xC47EBd6c0f68fD5963005D28D0ba533750E5C11B",
      "0x34eD182D0812D119c92907852D2B429f095A9b07",
      "0x836A808d4828586A69364065A1e064609F5078c7",
      "0x9848482da3Ee3076165ce6497eDA906E66bB85C5",
      ADDRESSES.ethereum.vlCVX,
    ],
    owners: [multisig, donationEvent, usdcVault, usdtVault, pethVault],
    ownTokens: [jpegd, lp],
    resolveLP: true,
    resolveUniV3: true,
  },
});
