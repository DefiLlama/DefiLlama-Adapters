const { sumTokens2, getSolBalanceFromStakePool } = require("../helper/solana");

async function tvl(api) {
  await getSolBalanceFromStakePool('po1osKDWYF9oiVEGmzKA4eTs8eMveFRMox3bUKazGN2', api)
  return sumTokens2({
    tokenAccounts: [
      'AGuwBAj91dgz1fhaK4qgYcH7SohyZEMK1VXTizFsWjq7',
      'Q75n2KgZp7insTKkavJWftWWuGDDUuHMquosQ5hbn7G',
      'HBjQ1jF2ynYFpwx46qiZsKE3rmvgEcxnkhvKeGP6omUd',
      '6eLZQKhbiBNmR4PiDFJgE6TZAoH3BwR6ceVwc3K1YjBZ',
      'HNw9tA7sWvjDH4cDCykj23Q4ifkKZerr6MbMfFXgyp62',
      'Gwa3a4VJbAyorLhn6TEeWLbQ4tWyup4E6oL3WjAga7tx',
    ],
    balances: api.getBalances()
  })
}

module.exports = {
  timetravel: false,
  methodology: "TVL is calculated by summing all re-staked assets.",
  solana: { tvl },
};
