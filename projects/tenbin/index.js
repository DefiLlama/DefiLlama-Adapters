// Tenbin's issued tokens, keyed by chain. Each token is a fully-backed,
// yield-bearing tokenized real-world asset (e.g. tGLD = Tenbin Gold).
// stGLD (staked tGLD) is excluded — tGLD.totalSupply() already counts tGLD
// held by the staking contract, so counting stGLD would double-count.
const config = {
  ethereum: {
    tGLD: "0x6a547b25534234bb79CE6961a23Db13DE154b6F4",
  },
};

module.exports = {
  methodology:
    "Tenbin is an asset tokenization protocol that brings liquid, yield-bearing " +
    "real-world assets (precious metals, FX and commodities) on-chain. TVL sums the " +
    "total value of Tenbin's issued tokens",
  start: "2026-02-10",
  ethereum: {
    tvl: async (api) => {
      const tokens = Object.values(config.ethereum);
      const supplies = await api.multiCall({ abi: "erc20:totalSupply", calls: tokens });
      api.addTokens(tokens, supplies);
    },
  },
};
