const ADDRESSES = require("../helper/coreAssets.json");
const { treasuryExports, nullAddress } = require("../helper/treasury");
const multisig='0x46488d2D36D8983de980Ff3b9f046DCd0a9DC2ae'

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
    owners: [multisig],
    ownTokens: [UNO],
  },
});
