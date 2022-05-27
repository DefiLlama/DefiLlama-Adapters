const zero = (timestamp, block) => ({});

module.exports = {
  timetravel: false,
  methodology: "We query Mars protocol smart contracts to get the amount of assets deposited and borrowed, then use CoinGecko to price the assets in USD.",
  terra: {
    tvl: zero,
    borrowed: zero,
  },
};
