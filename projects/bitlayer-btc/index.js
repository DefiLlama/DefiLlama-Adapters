const { sumTokensExport } = require("../helper/sumTokens");
const { bitlayerBridge } = require("../helper/bitcoin-book");
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  bitcoin: {
    tvl: sumTokensExport({ owners: bitlayerBridge })
  },
  ethereum: {
    tvl: sumTokensExport({
      ownerTokens: [
        [[ADDRESSES.ethereum.USDT], "0x92221E8Bc4E1D9a3E5D1cC39A524E90Cd4bdF8b1",], //USDT
        [[ADDRESSES.ethereum.USDT], "0x6bc2b644A0D124F1e5dDf5a9BDd922e65a961343",],//usdt
        [[ADDRESSES.null],"0x0CA2a8900b8140E1e70dc96F32857732f5F67B31",], //eth
        [[ADDRESSES.ethereum.WSTETH],"0x6ac1108461189F1569e1D4dEdc9940a0395d3423",]] //eth
    }),
  },
};
