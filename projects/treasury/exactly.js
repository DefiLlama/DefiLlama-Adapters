const sdk = require("@defillama/sdk");

/** @type {Record<string, { auditor: string }>} */
const config = {
  ethereum: {
    auditor: "0x310A2694521f75C7B2b64b5937C16CE65C3EFE01",
  },
  optimism: {
    auditor: "0xaEb62e6F27BC103702E7BC879AE98bceA56f027E",
  },
};

Object.entries(config).forEach(([chain, { auditor }]) => {
  module.exports[chain] = {
    tvl: async (_, __, ___, { api }) => {
      const markets = await api.call({
        abi: abis.allMarkets,
        target: auditor,
        chain,
      });
      const treasuries = [
        ...new Set(
          await api.multiCall({
            abi: abis.treasury,
            calls: markets,
            chain,
          })
        ),
      ];
      const balances = {};
      await Promise.all(
        markets.map((market) =>
          Promise.all(
            treasuries.map(async (treasury) =>
              sdk.util.sumSingleBalance(
                balances,
                market,
                await api.call({
                  abi: "erc20:balanceOf",
                  target: market,
                  params: treasury,
                  chain,
                }),
                chain
              )
            )
          )
        )
      );
      return balances;
    },
    ownTokens: async (_, __, ___, ____) => ({}),
  };
});

const abis = {
  allMarkets: "function allMarkets() view returns (address[])",
  treasury: "function treasury() view returns (address)",
};
