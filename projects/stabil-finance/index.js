const { getCuratorTvl } = require("../helper/curators");
const { getUniTVL } = require("../helper/unknownTokens")

const morphoVaultOwners = ["0x64d7c7632C30C5a0f37a9a9970B6E42470Cb933D"];

module.exports = {
  methodology: "Count all assets are deposited in all vaults curated by Stabil Finance.",
  start: 1639350000,
  arbitrum: {
    tvl: async (api) => {
      return getCuratorTvl(api, { morphoVaultOwners })
    }
  },
  base: {
    tvl: async (api) => {
      return getCuratorTvl(api, { morphoVaultOwners })
    }
  },
  hyperliquid: {
    tvl: async (api) => {
      return getCuratorTvl(api, { morphoVaultOwners })
    }
  },
  cronos: {
    tvl: getUniTVL({
      factory: "0x5d29Dc483D4D0A709DBD9EBb5f3acd41c131B472",
      useDefaultCoreAssets: true,
    }),
  }
};
