const { blockQuery } = require('../helper/http')

const queryBlock = `query data($block: Int){
  leverageVaultPairStates(block: { number: $block }) {
      id
      assetBalanceRaw
      assetTokenAddress
      debtBalanceRaw
      debtTokenAddress
  }
}`

const SUBGRAPH_URL =
  "https://api.thegraph.com/subgraphs/name/dimasriat/factor-leverage-vault";

async function tvl(api) {
  const { leverageVaultPairStates } = await blockQuery(SUBGRAPH_URL, queryBlock, { api })

  for (let pairState of leverageVaultPairStates) {
    const { assetTokenAddress, assetBalanceRaw, debtTokenAddress, debtBalanceRaw } = pairState
    const decreasingDebt = debtBalanceRaw * -1
    api.add(assetTokenAddress, assetBalanceRaw)
    api.add(debtTokenAddress, decreasingDebt)
  }

  return api.getBalances()
}

module.exports = {
  doublecounted: true,
  arbitrum: { tvl }
};
