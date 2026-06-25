const sdk = require('@defillama/sdk')
const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')
const { getLogs2 } = require('../helper/cache/getLogs')
const { getCoreAssets, getUniqueAddresses, normalizeAddress } = require('../helper/tokenMapping')

const poolPositionAbi = 'function getPoolAndPositionInfo(uint256 tokenId) view returns ((address token0, address token1, uint24 fee, int24 tickSpacing, address hook), uint256 info)'
const liquidityLockedAbi = 'event LiquidityLocked(uint256 indexed lockId, address indexed owner, address positionManager, uint256 tokenId, bytes32 indexed poolId, uint256 amount, uint256 unlockTime)'

const polygonUniV4Config = {
  nftAddress: '0x1ec2ebf4f37e7363fdfe3551602425af0b3ceef9',
  stateViewer: '0x5ea1bd7974c8a611cbab0bdcafcb1d9cc9b3ba5a',
}

const config = {
  ethereum: {
    nftAddress: '0xbd216513d74c8cf14cf4747e6aaa6420ff64ee9e',
    lockers: [
      { address: '0x147aeca171a79466fe9e2c03f21b45155ff403f8', fromBlock: 24124800 },
      { address: '0x30529ac67d5ac5f33a4e7fe533149a567451f023', fromBlock: 22561956 },
      { address: '0x6a76da1eb2cbe8b0d52cfe122c4b7f0ca5a940ef', fromBlock: 21824176 },
    ],
  },
  bsc: {
    nftAddress: '0x7a4a5c919ae2541aed11041a1aeee68f1287f95b',
    lockers: [
      { address: '0x62d61d5695013a5aa29a628b83d91e240984b613', fromBlock: 57649799 },
      { address: '0xd8c5bb7137021d93e70b7814c697bed303573b21', fromBlock: 73426670 },
      { address: '0xa55d5ce984e9e933732cdf51095af8f3fb374ac8', fromBlock: 76356039 },
    ],
  },
  polygon: {
    nftAddress: polygonUniV4Config.nftAddress,
    lockers: [
      { address: '0x1ec811ad6039e33b86458cdb267667af083261ed', fromBlock: 75223118 },
      { address: '0x5cff5c8e4ab3ef911dbcfc6698663f5f471899d1', fromBlock: 81667607 },
    ],
    uniV4ExtraConfig: polygonUniV4Config,
  },
  arbitrum: {
    nftAddress: '0xd88f38f930b7952f2db2432cb002e7abbf3dd869',
    lockers: [
      { address: '0x62d61d5695013a5aa29a628b83d91e240984b613', fromBlock: 368579416 },
      { address: '0xfd52659dd221356e0f703cfa070c1213a0a1575b', fromBlock: 421515019 },
    ],
  },
  base: {
    nftAddress: '0x7c5f5a4bbd8fd63184577525326123b519429bdc',
    lockers: [
      { address: '0x1ec811ad6039e33b86458cdb267667af083261ed', fromBlock: 25822354 },
      { address: '0x1da374c9fa108e1f9d3c50e8e2ef2113eefae617', fromBlock: 40141340 },
      { address: '0xd0cbff53620a345205750a14f03739806cffbd67', fromBlock: 30021069 },
      { address: '0x610b43e981960b45f818a71cd14c91d35cda8502', fromBlock: 30400440 },
      { address: '0xff908ded2a6c68226d3f834b25d803a815bdb28b', fromBlock: 40832905 },
    ],
  },
  unichain: {
    nftAddress: '0x4529a01c7a0410167c5740c487a8de60232617bf',
    lockers: [
      { address: '0x6606b00eb636e1149cacc7f8d3d23d1638b36481', fromBlock: 8541422 },
      { address: '0x52d6dbd7939e45094c1a3df563d9d8fc66943b91', fromBlock: 17521503 },
      { address: '0xb08b965e966b5a042cfe64d5b5978ed1cb48b8a1', fromBlock: 36341848 },
    ],
  },
}

module.exports = {
  misrepresentedTokens: true,
}

Object.keys(config).forEach(chain => {
  const { lockers, nftAddress, uniV4ExtraConfig = {} } = config[chain]

  module.exports[chain] = {
    tvl: async (api) => {
      const whitelistedTokens = getUniqueAddresses([...await getCoreAssets(api.chain), nullAddress], api.chain)
      const positions = await getPositions({ api, lockers, nftAddress })
      const { oneSidedPositionIds, corePositionIds } = splitPositionsByCoreAssets(api, positions, whitelistedTokens)

      await Promise.all([
        addPositions({ api, nftAddress, positionIds: oneSidedPositionIds, whitelistedTokens, uniV4ExtraConfig, double: true }),
        addPositions({ api, nftAddress, positionIds: corePositionIds, whitelistedTokens, uniV4ExtraConfig }),
      ])

      return api.getBalances()
    },
  }
})

async function getPositions({ api, lockers, nftAddress }) {
  const positions = await getPositionsFromLogs({ api, lockers, nftAddress })

  if (!positions.length) return []

  const positionOwners = await api.multiCall({
    abi: 'function ownerOf(uint256) view returns (address)',
    calls: positions.map(position => position.id),
    target: nftAddress,
    permitFailure: true,
  })

  const ownedPositions = positions.filter((position, i) => positionOwners[i]?.toLowerCase() === position.locker.toLowerCase())
  const positionsMissingPoolKey = ownedPositions.filter(position => !position.poolKey)

  if (positionsMissingPoolKey.length) {
    const positionInfos = await api.multiCall({
      abi: poolPositionAbi,
      target: nftAddress,
      calls: positionsMissingPoolKey.map(position => position.id),
      permitFailure: true,
    })

    positionsMissingPoolKey.forEach((position, i) => position.poolKey = positionInfos[i]?.[0])
  }

  return ownedPositions.filter(position => position.poolKey)
}

async function getPositionsFromLogs({ api, lockers, nftAddress }) {
  const positionsById = {}
  const logsByLocker = await Promise.all(lockers.map(async ({ address, fromBlock }) => {
    const logs = await getLogs2({ api, target: address, fromBlock, eventAbi: liquidityLockedAbi ,})
    return { address, logs }
  }))

  logsByLocker.forEach(({ address, logs }) => {
    logs.forEach(log => {
      if (log.positionManager.toLowerCase() !== nftAddress.toLowerCase()) return
      const id = log.tokenId.toString()
      positionsById[`${address.toLowerCase()}-${id}`] = { id, locker: address }
    })
  })

  return Object.values(positionsById)
}

function splitPositionsByCoreAssets(api, positions, whitelistedTokens) {
  const whitelist = new Set(whitelistedTokens)
  const oneSidedPositionIds = []
  const corePositionIds = []

  positions.forEach(({ id, poolKey }) => {
    const token0Whitelisted = whitelist.has(normalizeAddress(poolKey.token0, api.chain))
    const token1Whitelisted = whitelist.has(normalizeAddress(poolKey.token1, api.chain))
    const whitelistedCount = Number(token0Whitelisted) + Number(token1Whitelisted)

    if (whitelistedCount === 1) oneSidedPositionIds.push(id)
    else if (whitelistedCount === 2) corePositionIds.push(id)
  })

  return { oneSidedPositionIds, corePositionIds }
}

async function addPositions({ api, nftAddress, positionIds, whitelistedTokens, uniV4ExtraConfig, double = false }) {
  if (!positionIds.length) return

  const targetApi = double ? new sdk.ChainApi({ chain: api.chain, block: api.block, timestamp: api.timestamp }) : api
  await sumTokens2({
    api: targetApi,
    resolveUniV4: true,
    uniV4ExtraConfig: { ...uniV4ExtraConfig, nftAddress, positionIds, whitelistedTokens },
  })
  if (double) api.addBalances(targetApi.getBalancesV2().clone(2).getBalances())
}
