const { getBalance } = require("@defillama/sdk/build/eth");
const { getBlock } = require("@defillama/sdk/build/util/blocks");

module.exports = {
  rsk: {
    tvl: async (api) => {
      const block = (await getBlock("rsk", api.timestamp)).block;
      const unminted =
        (
          await getBalance({
            target: "0x0000000000000000000000000000000001000006",
            chain: api.chain,
            block,
          })
        ).output / 1e18;

      const minted = 21e6 - unminted;

      return { "coingecko:bitcoin": minted };
    },
  },
};
