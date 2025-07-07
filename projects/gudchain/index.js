const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const launchBridge = "0xd759e176DEF0F14e5C2D300238d41b1CBB5585BF";

module.exports = {
  ethereum: {
    tvl: sumTokensExport({
      owner: launchBridge,
      tokens: [
        ADDRESSES.null,
        ADDRESSES.ethereum.STETH,
        ADDRESSES.bsc.wBETH,
        ADDRESSES.ethereum.METH,
        ADDRESSES.ethereum.DAI,
        ADDRESSES.ethereum.SDAI,
        ADDRESSES.ethereum.USDT,
        ADDRESSES.ethereum.USDC
      ]
    })
  }
};
