const sdk = require("@defillama/sdk");
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
  misrepresentedTokens: true,
  methodology:
    "We use the totalSupply() method which includes the interest accrued on the deposited USDC.",
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl: async (_, _b, { [chain]: block }) => {
      const vaults = Object.values(config[chain].vaults);
      const { output: balances } = await sdk.api.abi.multiCall({
        abi: abi.totalSupply,
        calls: vaults.map((i) => ({ target: i })),
        chain,
        block,
      });
      return {
        tether: balances.reduce((a, { output }) => a + output / 1e6, 0),
      };
    },
  };
});
