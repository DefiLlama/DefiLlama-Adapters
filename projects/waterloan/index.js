module.exports = {
  deadFrom: '2022-10-23',
    methodology: `Counts all tokens locked in the contracts to be used as collateral in lending pool. Borrowed coins are not counted towards the TVL, only the coins actually locked in the contracts are counted.`,
  csc: {
    tvl: () => ({}),
    borrowed: () => ({}) // bad debt waterloan("csc", true),
  },
  smartbch: {
    tvl: () => ({}),
    borrowed: () => ({}) // bad debt waterloan("smartbch", true),
  },
};
