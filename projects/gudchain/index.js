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
        "0xa2E3356610840701BDf5611a53974510Ae27E2e1",
        "0xd5F7838F5C461fefF7FE49ea5ebaF7728bB0ADfa",
        ADDRESSES.ethereum.DAI,
        ADDRESSES.ethereum.SDAI,
        ADDRESSES.ethereum.USDT,
        ADDRESSES.ethereum.USDC
      ]
    })
  }
};
