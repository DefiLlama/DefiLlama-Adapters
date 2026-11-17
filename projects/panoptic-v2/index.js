const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs2 } = require('../helper/cache/getLogs')

const NULL_ADDRESS = ADDRESSES.null

const methodology = 'Counts assets managed by Panoptic V2 collateral trackers for all PanopticPool contracts deployed by the PanopticFactoryV3 and PanopticFactoryV4 contracts, plus the underlying tokens that Panoptic PLP vaults hold idle before depositing them into a collateral tracker. CollateralTracker.totalAssets() includes tracked deposits, assets deployed into AMM positions, and unrealized interest, so no separate SFPM chunk/subgraph accounting is needed.'

const abi = {
  PoolDeployedV3: 'event PoolDeployed(address indexed poolAddress, address indexed uniswapPool, address collateralTracker0, address collateralTracker1, address riskEngine)',
  PoolDeployedV4: 'event PoolDeployed(address indexed poolAddress, bytes32 indexed idV4, address collateralTracker0, address collateralTracker1, address riskEngine)',
}

const factories = [
  {
    target: '0x0000000000000aDC9A108591e718F2aee963a2a7',
    eventAbi: abi.PoolDeployedV3,
    extraKey: 'pool-deployed-v3',
  },
  {
    target: '0x0000000000000c51d0f8cf4bd9adE7191372a625',
    eventAbi: abi.PoolDeployedV4,
    extraKey: 'pool-deployed-v4',
  },
]

const config = {
  ethereum: {
    startBlock: 25276309,
    factories,
    // PLP vaults, with the block each one was deployed at
    vaults: [
      { address: '0xd4e2c720a760049cc4151bcf61e3a9348db9cd92', fromBlock: 25296736 },
      { address: '0x236d0558f06cd60780b232d4ec4c92d2cb7e4d18', fromBlock: 25296782 },
      { address: '0x779a2aa634a004b3a3f3b322083744869bbc6d66', fromBlock: 24809033 },
      { address: '0x963fe9c93bc353602656ee4051a75114ba74d6c5', fromBlock: 24809057 },
    ],
  },
  robinhood: {
    startBlock: 62901925,
    factories,
    vaults: [
      { address: '0x08b24123252bd9c4dd473b6573d4cf67196ffc4b', fromBlock: 63972776 },
    ],
  },
}

async function tvl(api) {
  const { startBlock, factories, vaults } = config[api.chain]
  const block = await api.getBlock()

  const logs = []
  for (const { target, eventAbi, extraKey } of factories) {
    const factoryLogs = await getLogs2({
      api,
      target,
      fromBlock: startBlock,
      eventAbi,
      extraKey,
      skipCacheRead: true,
      onlyArgs: false,
      transform: (log) => ({
        blockNumber: log.blockNumber,
        collateralTracker0: log.args.collateralTracker0,
        collateralTracker1: log.args.collateralTracker1,
      }),
    })
    logs.push(...factoryLogs.filter((log) => log.blockNumber <= block))
  }

  const collateralTrackers = [
    ...new Set(
      logs
        .flatMap(({ collateralTracker0, collateralTracker1 }) => [
          collateralTracker0,
          collateralTracker1,
        ])
        .map((address) => address.toLowerCase())
    ),
  ]

  const tokens = await api.multiCall({
    abi: 'function asset() external view returns (address)',
    calls: collateralTrackers,
  })
  // V2 tracks AMM-deployed assets inside each CollateralTracker, unlike V1/V1.1
  // where the adapter reconstructs SFPM liquidity chunks separately.
  const balances = await api.multiCall({
    abi: 'function totalAssets() external view returns (uint256)',
    calls: collateralTrackers,
  })

  tokens.forEach((token, i) => {
    if (token.toLowerCase() === NULL_ADDRESS) return api.addGasToken(balances[i])
    api.add(token, balances[i])
  })

  // The vaults' collateral tracker shares are already in totalAssets() above; this adds what they have not deposited yet
  const liveVaults = vaults.filter((vault) => vault.fromBlock <= block).map((vault) => vault.address)
  const underlyings = await api.multiCall({ abi: 'address:underlyingToken', calls: liveVaults })
  await api.sumTokens({ tokensAndOwners: liveVaults.map((vault, i) => [underlyings[i], vault]) })
}

module.exports = {
  ethereum: {
    tvl,
    methodology,
    start: '2026-06-09',
  },
  robinhood: {
    tvl,
    methodology,
    start: '2026-09-14',
  },
}
