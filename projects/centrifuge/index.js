const JTRSY = "0x8c213ee79581Ff4984583C6a801e5263418C4b86";

module.exports = {
  methodology: "TVL corresponds to the total amount of JTRSY minted onchain across Ethereum, Base, and Arbitrum.",
  ethereum: {
    tvl: async (api) => {
      const decimals = await api.call({ abi: 'erc20:decimals', target: JTRSY })
      const supply = await api.call({ abi: "erc20:totalSupply", target: JTRSY });
      api.addUSDValue(supply / 10 ** (decimals));
    },
  },
  base: {
    tvl: async (api) => {
      const decimals = await api.call({ abi: 'erc20:decimals', target: JTRSY })
      const supply = await api.call({ abi: "erc20:totalSupply", target: JTRSY });
      api.addUSDValue(supply / 10 ** (decimals));
    },
  },
  arbitrum: {
    tvl: async (api) => {
      const decimals = await api.call({ abi: 'erc20:decimals', target: JTRSY })
      const supply = await api.call({ abi: "erc20:totalSupply", target: JTRSY });
      api.addUSDValue(supply / 10 ** (decimals));
    },
  },
};