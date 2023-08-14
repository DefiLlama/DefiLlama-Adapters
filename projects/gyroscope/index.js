const { transformBalances } = require('../helper/portedTokens')
const sdk = require('@defillama/sdk')
const { getConfig } = require('../helper/cache')

async function tvl(_, _b, _cb, { api, }) {
  const balances = {}

  const poolIds = (await getConfig(`gyroscope/${api.chain}`, `https://app.gyro.finance/whitelist/${api.chain}.json`))

  const vault = await api.call({
    target: poolIds[0].slice(0, 42),
    abi: 'address:getVault',
  })
  const data = await api.multiCall({
    abi: 'function getPoolTokens(bytes32 poolId) view returns (address[] tokens, uint256[] balances, uint256 lastChangeBlock)',
    calls: poolIds,
    target: vault
  })

  data.forEach(i => {
    i.tokens.forEach((t, j) => sdk.util.sumSingleBalance(balances, t, i.balances[j]))
  })

  return transformBalances(api.chain, balances)
}

module.exports = {
  methodology: 'sum of all the tokens locked in CLPs',
  polygon: {
    tvl
  },
  optimism: {
    tvl
  },
  ethereum: {
    tvl
  }
}