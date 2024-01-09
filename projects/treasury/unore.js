const ADDRESSES = require("../helper/coreAssets.json");
const { treasuryExports, nullAddress } = require("../helper/treasury");

const treasury = [
  "0x46488d2D36D8983de980Ff3b9f046DCd0a9DC2ae",
  "0xAb461d4Bfd54785DEe8fc3fD79994962A09582dA",
  "0xA7f8B0DA0073ff91a30B6682aBB13416aAD7d30c",
  "0x7f4C824dF0767a5e4eb420Ef816F45F8324E2024",
  "0x3b4F393aB7030A5ee63340eF2eE3244acc5d6bbc",
];
const UNO = "0x474021845c4643113458ea4414bdb7fb74a01a77";

module.exports = treasuryExports({
  ethereum: {
    tokens: [
      nullAddress,
      ADDRESSES.ethereum.USDC,//USDC
      ADDRESSES.ethereum.DAI,//DAI
      ADDRESSES.ethereum.WETH,//WETH
      ADDRESSES.ethereum.USDT,//USDT
    ],
    owners: treasury,
    ownTokens: [UNO],
  },
});
