const abi = require("./abi.json");

const config = {
  kava: {
    vaults: {
      BToken: "0xF47BD463e153C7e20Aa044759bac1B6A7c263725",
    },
  },
  ethereum: {
    vaults: {
      BToken: "0x9b64f4842a7fDd16063CdC7cD3ad123C7Bd4918c",
    },
  },
};

module.exports = {
  deadFrom: '2023-07-21',
  methodology:
    "We use the totalSupply() method which includes the interest accrued on the deposited USDC.",
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl: async (api) => {
      const vaults = Object.values(config[chain].vaults);
      const tokens = await api.multiCall({  abi: abi.UNDERLYING_ASSET_ADDRESS, calls: vaults})
      return api.sumTokens({ tokensAndOwners2: [tokens, vaults]})
    },
    borrowed: () => ({}),
  };
});
