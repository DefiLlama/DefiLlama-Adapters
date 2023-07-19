module.exports = {
  timetravel: false,
  methodology: `We use the Anchor subgraph to get the amount of bLUNA and bETH used as collateral on anchor and the UST that is on anchor but has not been lent, we then use Coingecko to price the tokens in USD.`,
  terra: {
    tvl: () => ({}),
    // borrowed
  },
  avax: {
    tvl: () => ({}),
  },
  hallmarks: [
    [1651881600, "UST depeg"],
  ]
}
