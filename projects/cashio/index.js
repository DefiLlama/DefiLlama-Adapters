module.exports = {
  timetravel: false,
  hallmarks: [
    [1647993600, "Infinite mint glitch"]
  ],
  deadFrom: 1667993600,
  methodology:
    "TVL counts LP token deposits made to Cashio and accrued reward tokens to its bank. CoinGecko is used to find the price of tokens in USD.",
  solana: { tvl: () => ({}) },
};
