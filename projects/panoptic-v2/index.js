const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs2 } = require('../helper/cache/getLogs')

const NULL_ADDRESS = ADDRESSES.null

const methodology = 'Counts assets managed by Panoptic V2 collateral trackers for all PanopticPool contracts deployed by the PanopticFactoryV3 and PanopticFactoryV4 contracts. CollateralTracker.totalAssets() includes tracked deposits, assets deployed into AMM positions, and unrealized interest, so no separate SFPM chunk/subgraph accounting is needed.'

const abi = {
  PoolDeployedV3: 'event PoolDeployed(address indexed poolAddress, address indexed uniswapPool, address collateralTracker0, address collateralTracker1, address riskEngine)',
  PoolDeployedV4: 'event PoolDeployed(address indexed poolAddress, bytes32 indexed idV4, address collateralTracker0, address collateralTracker1, address riskEngine)',
}

const config = {
  ethereum: {
    startBlock: 25276309,
    factories: [
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
    ],
  },
}

async function tvl(api) {
  const { startBlock, factories } = config[api.chain]
  const logs = (
    await Promise.all(
      factories.map(({ target, eventAbi, extraKey }) =>
        getLogs2({
          api,
          target,
          fromBlock: startBlock,
          eventAbi,
          extraKey,
          skipCacheRead: true,
          onlyArgs: false,
          transform: (log) => ({
            blockNumber: log.blockNumber,
            poolAddress: log.args.poolAddress,
            collateralTracker0: log.args.collateralTracker0,
            collateralTracker1: log.args.collateralTracker1,
          }),
        })
      )
    )
  ).flat().filter((log) => !api.block || log.blockNumber <= api.block)

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
}

module.exports = {
  ethereum: {
    tvl,
    methodology,
    start: 1780965215,
  },
}
