const { blockQuery } = require('../helper/http')

const queryBlock = `query  data($block: Int){
  leverageVaultPoolTokenStates(where: { balanceRaw_gt: 0} block: { number: $block }) {
    id type underlyingAssetAddress      balanceRaw
  }
}`

const SUBGRAPH_URL =
  "https://api.thegraph.com/subgraphs/name/dimasriat/factor-leverage-vault";

async function tvl(timestamp, ethBlock, chainBlocks, { api }) {
  const { leverageVaultPoolTokenStates } = await blockQuery(SUBGRAPH_URL, queryBlock, { api })

  for (let poolTokenState of leverageVaultPoolTokenStates) {
    let { underlyingAssetAddress, balanceRaw } = poolTokenState;
    if (poolTokenState.type === 'debt') balanceRaw *= -1
    api.add(underlyingAssetAddress, balanceRaw)
  }

  return api.getBalances()
}

module.exports = {
  doublecounted: true,
  arbitrum: { tvl }
};
