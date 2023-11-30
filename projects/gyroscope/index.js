const { transformBalances } = require('../helper/portedTokens')
const sdk = require('@defillama/sdk')

const GYRO_POOL_ADDRESSES = [
  "0x17f1ef81707811ea15d9ee7c741179bbe2a63887",
  "0x97469e6236bd467cd147065f77752b00efadce8a",
  "0xdac42eeb17758daa38caf9a3540c808247527ae3",
  "0xf0ad209e2e969eaaa8c882aac71f02d8a047d5c2",
  "0xfa9ee04a5545d8e0a26b30f5ca5cbecd75ea645f"
]

async function tvl(_, _b, _cb, { api, }) {
  const balances = {}

  const poolIds = await api.multiCall({
    abi: 'function getPoolId() view returns (bytes32)',
    calls: GYRO_POOL_ADDRESSES,
  })

  const vault = await api.call({
    target: GYRO_POOL_ADDRESSES[0],
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