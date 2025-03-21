const JTRSY = "0x8c213ee79581Ff4984583C6a801e5263418C4b86";

module.exports = {
  methodology: "TVL corresponds to the total amount of JTRSY minted onchain across Ethereum, Base, and Arbitrum.",
  ethereum: {
    tvl: async (api) => {
      const supply = await api.call({ abi: "erc20:totalSupply", target: JTRSY });
      api.add(JTRSY, supply);
    },
  },
  base: {
    tvl: async (api) => {
      const supply = await api.call({ abi: "erc20:totalSupply", target: JTRSY });
      api.add(JTRSY, supply);
    },
  },
  arbitrum: {
    tvl: async (api) => {
      const supply = await api.call({ abi: "erc20:totalSupply", target: JTRSY });
      api.add(JTRSY, supply);
    },
  },
};