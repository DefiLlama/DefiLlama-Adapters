const { staking } = require('../helper/staking');

const config = {
  polygon: { staker: '0x9C58a2B79cd054442D5970b925637B9E88E7ecc2', token: '0x57999936fC9A9EC0751a8D146CcE11901Be8beD0', factory: '0xd4E3668A9C39ebB603f02A6987fC915dBC906B43' },
  arbitrum: { staker: '0x68748818983CD5B4cD569E92634b8505CFc41FE8', token: '0xd1E094CabC5aCB9D3b0599C3F76f2D01fF8d3563', factory: '0x389DB0B69e74A816f1367aC081FdF24B5C7C2433' },
}

module.exports = {
  methodology: 'Sum of all pools liquidity plus staked VRSW tokens',
}

Object.keys(config).forEach(chain => {
  const { staker, token } = config[chain]
  module.exports[chain] = { tvl, staking: staking(staker, token) }
})


async function tvl(api) {
  const pools = await api.fetchList({ lengthAbi: 'allPairsLength', itemAbi: 'allPairs', target: config[api.chain].factory })
  const tokenLength = await api.multiCall({ abi: 'uint256:allowListLength', calls: pools })
  const nativeTokens = await api.multiCall({ abi: 'function getTokens() view returns (address, address)', calls: pools })
  const calls = []
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    const tokensNumber = tokenLength[i];
    for (let j = 0; j < tokensNumber; j++) {
      calls.push({ target: pool, params: [j], poolId: i });
    }
  }
  const tokens = await api.multiCall({ abi: 'function allowList(uint256) view returns (address)', calls })
  const ownerTokens = pools.map((v, i) => [nativeTokens[i], v])
  tokens.forEach((v, i) => {
    const tokens = ownerTokens[calls[i].poolId][0]
    tokens.push(v)
  })

  return api.sumTokens({ ownerTokens, });
}