module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "Sums the total locked collateral value in usd across all vaults.",
  deadFrom: '2024-04-22', // part of compx now
  algorand: {
    tvl: async () => {
      return {}
    }
  },
}