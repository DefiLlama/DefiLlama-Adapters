
const { getCompoundV2Tvl } = require("../helper/compound")

module.exports = {
  methodology:
    "includes the liquidity provided to the infrasturcture and ecosystem of Native",
};

const config = {
  arbitrum: {
    vault: "0x795E5cCdd008637EB98c64958d3b8Ba3e6DE2d2B",
    fromBlock: 211430925,
  },
  zklink: {
    vault: "0x4AC97E2727B0e92AE32F5796b97b7f98dc47F059",
    vaultFromBlock: 452,
  },
};

Object.keys(config).forEach((chain) => {
  const { vault, vaultFromBlock } = config[chain];
  module.exports[chain] = {
    tvl: getCompoundV2Tvl(vault, chain)
  };
});
