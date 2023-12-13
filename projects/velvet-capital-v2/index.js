const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')
const { getConfig, } = require('../helper/cache')
const { getLogs } = require('../helper/cache/getLogs')

async function tvl(_, _b, _cb, { api, }) {
  // const response = await getConfig('velvet-capital/v2', 'https://defivas.org/api/v2/portfolio/all');
  // const data = response.data.data;
  // const indexes = data.map(items=> items.indexSwap);
  const indexes = await api.fetchList({ lengthAbi: 'uint256:indexId', itemAbi: 'function getIndexList(uint256) view returns (address)', target: '0xE61472Ce45e559830ECF12F6a215Cd732F4D798B' })
  const [tokens, vaults] = await Promise.all([
    api.multiCall({ abi: 'address[]:getTokens', calls: indexes }),
    api.multiCall({ abi: 'address:vault', calls: indexes }),
  ])

  const ownerTokens = tokens.map((tokens, i) => [tokens, vaults[i]]);
  return sumTokens2({ api, ownerTokens, resolveLP: true });
}

module.exports = {
  methodology: 'calculates overall value deposited across different protocol portfolios',
  bsc: { tvl }
}
