const GGBR = "0x7e2ac793f3E692f388e66c7DC28F739d13B0B71A";

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "TVL represents the total supply of GGBR tokens in circulation, a gold-backed RWA stablecoin pegged at 1/1000th the value of gold.",
  ethereum: {
    tvl: async (api) => {
      const totalSupply = await api.call({
        target: GGBR,
        abi: "erc20:totalSupply",
      });
      // GGBR has 18 decimals and is pegged at 1/1000th oz of gold
      // Express TVL as equivalent PAXG (1 PAXG = 1 oz gold = 1000 GGBR)
      api.addCGToken("pax-gold", totalSupply / 1e18 / 1000);
    },
  },
};
