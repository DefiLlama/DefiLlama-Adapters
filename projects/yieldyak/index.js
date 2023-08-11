const { staking } = require('../helper/staking');
const { cachedGraphQuery } = require('../helper/cache')

const graphUrl = 'https://api.thegraph.com/subgraphs/name/yieldyak/reinvest-tracker'
const graphQuery = `{ farms(first: 1000) { id }}`;

async function tvl(timestamp, ethBlock, chainBlocks, { api }) {
  const { farms } = await cachedGraphQuery('yieldyak', graphUrl, graphQuery)
  const tokens = await api.multiCall({  abi: 'address:depositToken', calls: farms.map(i => i.id), permitFailure: true, })
  const vals = await api.multiCall({  abi: 'uint256:totalDeposits', calls: farms.map(i => i.id), permitFailure: true, })
  tokens.forEach((token, i) => {
    if (!token || !vals[i]) return;
    api.add(token, vals[i])
  })
}

const masterYak = "0x0cf605484A512d3F3435fed77AB5ddC0525Daf5f"
const yakToken = "0x59414b3089ce2af0010e7523dea7e2b35d776ec7"

module.exports = {
  avax: {
    tvl,
    staking: staking(masterYak, yakToken),
  }
}