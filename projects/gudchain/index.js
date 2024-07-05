const { sumTokensExport } = require("../helper/unwrapLPs");

const launchBridge = "0xd759e176DEF0F14e5C2D300238d41b1CBB5585BF";

module.exports = {
  ethereum: {
    tvl: sumTokensExport({
      owner: launchBridge,
      start: 20203960,
      tokens: [
        "0x0000000000000000000000000000000000000000",
        "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84",
        "0xa2E3356610840701BDf5611a53974510Ae27E2e1",
        "0xd5F7838F5C461fefF7FE49ea5ebaF7728bB0ADfa",
        "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        "0x83F20F44975D03b1b09e64809B757c47f942BEeA",
        "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
      ]
    })
  }
};
