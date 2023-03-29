module.exports = {
  timetravel: false,
  methodology: "The pools on https://almond.so/ are included in TVL. Standard tokens (SOL, BTC, ETH, USDC, etc..), no pool 2. The API fetches the balances of the Solana accounts holding the staked tokens, then uses Coingecko prices to determine dollar values.",
  solana: {
    tvl: () =>  ({}), // project is dead
  },
};
