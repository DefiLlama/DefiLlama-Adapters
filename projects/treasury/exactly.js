const { sumTokens2 } = require('../helper/unwrapLPs')

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
    tvl: async (api) => {
      const markets = await api.call({ abi: abis.allMarkets, target: auditor, });
      const treasuries = await api.multiCall({ abi: abis.treasury, calls: markets, })
      return sumTokens2({ api, tokens: markets, owners: treasuries, })
    },
  };
});

const abis = {
  allMarkets: "function allMarkets() view returns (address[])",
  treasury: "function treasury() view returns (address)",
};
