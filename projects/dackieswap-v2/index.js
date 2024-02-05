const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  misrepresentedTokens: true,
  base: {
    tvl: getUniTVL({
      factory: "0x591f122D1df761E616c13d265006fcbf4c6d6551",
      useDefaultCoreAssets: true,
      fetchBalances: true
    })
  },
  optimism: {
    tvl: getUniTVL({
      factory: "0xaEdc38bD52b0380b2Af4980948925734fD54FbF4",
      useDefaultCoreAssets: true,
      fetchBalances: true
    })
  }
};