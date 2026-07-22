function add(map, key, delta) {
  key = key.toLowerCase()
  map.set(key, (map.get(key) ?? 0n) + BigInt(delta))
}

function getBorrowedByMarket(takes, repays, liquidations) {
  const borrowed = new Map()
  // `Take.units` also covers secondary transfers. `totalUnitsDelta` is the exact change in
  // aggregate debt/credit created or closed by the match.
  takes.forEach(log => add(borrowed, log.id_, log.totalUnitsDelta))
  repays.forEach(log => add(borrowed, log.id_, -BigInt(log.units)))
  liquidations.forEach(log =>
    add(borrowed, log.id_, -(BigInt(log.repaidUnits) + BigInt(log.badDebt))),
  )
  for (const [marketId, amount] of borrowed)
    if (amount < 0n) throw new Error(`Negative Midnight debt for market ${marketId}`)
  return borrowed
}

function getOnchainTvlByToken({ markets, suppliedCollateral, withdrawnCollateral, liquidations, repays, withdrawals, claimedContinuousFees }) {
  const balances = new Map()
  const loanToken = id => {
    const market = markets.get(id.toLowerCase())
    if (!market) throw new Error(`Missing Midnight market ${id}`)
    return market.loanToken
  }
  suppliedCollateral.forEach(log => add(balances, log.collateral, log.assets))
  withdrawnCollateral.forEach(log => add(balances, log.collateral, -BigInt(log.assets)))
  liquidations.forEach(log => {
    add(balances, log.collateral, -BigInt(log.seizedAssets))
    add(balances, loanToken(log.id_), log.repaidUnits)
  })
  repays.forEach(log => add(balances, loanToken(log.id_), log.units))
  withdrawals.forEach(log => add(balances, loanToken(log.id_), -BigInt(log.units)))
  claimedContinuousFees.forEach(log => add(balances, loanToken(log.id_), -BigInt(log.amount)))
  for (const [token, amount] of balances)
    if (amount < 0n) throw new Error(`Negative Midnight TVL balance for token ${token}`)
  return balances
}

module.exports = { getBorrowedByMarket, getOnchainTvlByToken }
