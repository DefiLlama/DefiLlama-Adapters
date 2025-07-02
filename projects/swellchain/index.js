const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: sumTokensExport({
      owners: [
        "0x7aA4960908B13D104bf056B23E2C76B43c5AACc8", // L1StandardBridge
        "0x758E0EE66102816F5C3Ec9ECc1188860fbb87812", // OptimismPortal2
        "0xecf3376512EDAcA4FBB63d2c67d12a0397d24121", // wstETH L1ERC20TokenBridge
      ],
      fetchCoValentTokens: true,
    }),
  }
};
