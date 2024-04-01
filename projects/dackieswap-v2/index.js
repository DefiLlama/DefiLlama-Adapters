const { getUniTVL } = require("../helper/unknownTokens");
const { stakings } = require("../helper/staking");

const DACKIE = "0xc2BC7A73613B9bD5F373FE10B55C59a69F4D617B";

const stakingPools = [
  // Lock & flexible pool
  "0x4Ad387bcb03B92a6e22A72391Cc37493Fc388B05",
];

module.exports = {
  misrepresentedTokens: true,
  base: {
    tvl: getUniTVL({
      factory: "0x591f122D1df761E616c13d265006fcbf4c6d6551",
      useDefaultCoreAssets: true,
      fetchBalances: true
    }),
    staking: stakings(stakingPools, DACKIE)
  },
  optimism: {
    tvl: getUniTVL({
      factory: "0xaEdc38bD52b0380b2Af4980948925734fD54FbF4",
      useDefaultCoreAssets: true,
      fetchBalances: true
    })
  },
  arbitrum: {
    tvl: getUniTVL({
      factory: "0x507940c2469e6E3B33032F1d4FF8d123BDDe2f5C",
      useDefaultCoreAssets: true,
      fetchBalances: true
    })
  },
  blast: {
    tvl: getUniTVL({
      factory: "0xF5190E64dB4cbf7ee5E72B55cC5b2297e20264c2",
      useDefaultCoreAssets: true,
      fetchBalances: true
    })
  },
  inevm: {
    tvl: getUniTVL({
      factory: "0x507940c2469e6E3B33032F1d4FF8d123BDDe2f5C",
      useDefaultCoreAssets: true,
      fetchBalances: true
    })
  }
};