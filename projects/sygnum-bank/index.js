const fund = "0x2AB105A3eAd22731082B790CA9A00D9A3A7627F9";

module.exports = {
  methodology: "TVL represents the total sum of all tokens minted in Fidelity's investment fund (FIUSD)",
  era: {
    tvl: async (api) => {
      const supply = await api.call({ target: fund, abi: "erc20:totalSupply" });
      api.add("0x2AB105A3eAd22731082B790CA9A00D9A3A7627F9", supply);
    },
  },
};
