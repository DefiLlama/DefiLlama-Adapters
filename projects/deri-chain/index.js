const sdk = require("@defillama/sdk");

module.exports = {
  arbitrum: {
    tvl: async (_, _b, _cb, { chain }) => {
      const balance = await sdk.api.eth.getBalance({
        target: "0xD4FE46D2533E7d03382ac6cACF0547F336e59DC0",
        chain,
      });

      return {
        "arbitrum:0x0000000000000000000000000000000000000000":
          balance.output,
      };
    },
  },
};
