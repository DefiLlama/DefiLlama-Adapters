const { getLogs } = require('../helper/cache/getLogs')

async function tvl(_, _b, _cb, { api }) {
  const factories = config[api.chain]

  const promises = factories.map(async ({ factory, fromBlock }) => {
    const logs = await getLogs({
      api,
      target: factory,
      eventAbi: 'event NewFXPool(address indexed caller, bytes32 indexed id, address indexed fxpool)',
      onlyArgs: true,
      fromBlock,
    })

    const pools = logs.map((i) => i.fxpool)
    const poolIds = await api.multiCall({
      abi: 'function getPoolId() view returns (bytes32)',
      calls: pools,
    })
    const vaults = await api.multiCall({
      abi: 'address:getVault',
      calls: pools,
    })

    const data = await api.multiCall({
      abi: 'function getPoolTokens(bytes32 poolId) view returns (address[] tokens, uint256[] balances, uint256 lastChangeBlock)',
      calls: poolIds.map((v, i) => ({ target: vaults[i], params: v })),
    })

    data.forEach((i) => api.addTokens(i.tokens, i.balances))
  })
  await Promise.all(promises)
  return api.getBalances()
}

module.exports = {
  methodology: 'sum of all the tokens locked in FX Pools',
  doublecounted: true, // tokens are stored in balancer vaults
}

const config = {
  polygon: [
    {
      name: 'FX Pool Factory',
      factory: '0x627D759314D5c4007b461A74eBaFA7EBC5dFeD71',
      fromBlock: 32054794,
    },
    {
      name: 'FX Pool Deployer',
      factory: '0xF169c1Ae8De24Da43a3dC5c5F05De412b4848bD3',
      fromBlock: 49368321,
    }
  ],
  ethereum: [
    {
      name: 'FX Pool Factory',
      factory: '0x81fE9e5B28dA92aE949b705DfDB225f7a7cc5134',
      fromBlock: 15981805,
    },
    {
      name: 'FX Pool Deployer',
      factory: '0xfb23Bc0D2629268442CD6521CF4170698967105f',
      fromBlock: 18469425,
    }
  ],
  avax: [
    {
      name: 'FX Pool Factory',
      factory: '0x81fE9e5B28dA92aE949b705DfDB225f7a7cc5134',
      fromBlock: 32585313,
    },
    {
      name: 'FX Pool Deployer',
      factory: '0x4042dC4110Ea9500338737605A60065c3de152C6',
      fromBlock: 37150792,
    }
  ]
}

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl }
})
