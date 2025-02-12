const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

// v1.1 factory
const factories = [
  '0x4bC45A5db58d4535FaF668F392035407d2a14E76', // v1
  '0xd74dEe1C78D5C58FbdDe619b707fcFbAE50c3EEe' // v1.1
]

// Deployed with an old contract
const V1_POOLS = [
  '0xa97FA6E9A764306107F2103a2024Cfe660c5dA33',
  '0x3424b0dd7715C8db92414DB0c5A9E5FA0D51cCb5',
  '0xfD763943f628e125CEE3D8d85DC0fc7098355d16',
  '0x8d713bC2d35327B536A8B2CCec9392e57C0D04B4',
  '0xd50ee26F62B1825d14e22e23747939D96746434c'
]

async function tvl(api) {
  const ownerTokens = []
  const token0s = await api.multiCall({  abi: 'address:token0', calls: V1_POOLS})
  const token1s = await api.multiCall({  abi: 'address:token1', calls: V1_POOLS})

  ownerTokens.push(...V1_POOLS.map((pool, idx) => [[token0s[idx], token1s[idx]], pool]))
  
  const logs = await getLogs2({ api, target: factories[1], eventAbi: 'event PoolCreated(address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address feeManager, address pool)', fromBlock: 1, })

  ownerTokens.push(...logs.map(l => [[l.token0, l.token1], l.pool]))
  return sumTokens2({ api, ownerTokens })
}

module.exports = {
  vinu: {
    tvl
  }
}