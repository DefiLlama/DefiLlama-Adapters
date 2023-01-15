
const { getLogs, getAddress } = require('../helper/cache/getLogs')
const { transformBalances } = require('../helper/portedTokens')
const sdk = require('@defillama/sdk')

async function tvl(_, _b, _cb, { api, }) {
  const balances = {}
  const logs = await getLogs({
    api,
    target: '0x90f08b3705208e41dbeeb37a42fb628dd483adda',
    topics: ['0x83a48fbcfc991335314e74d0496aab6a1987e992ddc85dddbcc4d6dd6ef2e9fc'],
    fromBlock: 31556094,
  })

  const pools = logs.map(i => getAddress(i.topics[1]))
  const poolIds = await api.multiCall({
    abi: 'function getPoolId() view returns (bytes32)',
    calls: pools,
  })

  const vault = await api.call({
    target: pools[0],
    abi: 'address:getVault',
  })
  const data = await api.multiCall({
    abi: 'function getPoolTokens(bytes32 poolId) view returns (address[] tokens, uint256[] balances, uint256 lastChangeBlock)',
    calls: poolIds,
    target: vault
  })

  data.forEach(i => {
    i.tokens.forEach((t, j) => sdk.util.sumSingleBalance(balances,t,i.balances[j]))
  })
  
  return transformBalances(api.chain, balances)
}

module.exports = {
  methodology: 'sum of all the tokens locked in CLPs',
  polygon: {
    tvl
  }
}