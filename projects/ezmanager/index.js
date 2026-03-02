const { getLogs } = require('../helper/cache/getLogs')

const CL_CORE = '0x61c36AFF32Be348a3D1FE1E2B4745048f652770F'
const FROM_BLOCK = 42111754
const VALUE_CHUNK_SIZE = 50

const abi = {
  usdc: 'address:USDC',
  positionValueUSDC: 'function positionValueUSDC(bytes32[] keys) view returns ((bytes32 key, uint256 valueUSDC)[] results)',
}

const events = {
  positionRegistered: 'event PositionRegistered(address indexed owner, bytes32 indexed key, uint256 tokenId)',
  positionRemoved: 'event PositionRemoved(address indexed owner, bytes32 indexed key, uint256 tokenId)',
}

function chunkArray(items, size) {
  const out = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}

async function tvl(api) {
  const [registerLogs, removeLogs] = await Promise.all([
    getLogs({
      api,
      target: CL_CORE,
      fromBlock: FROM_BLOCK,
      eventAbi: events.positionRegistered,
      onlyArgs: true,
      extraKey: 'positionRegistered',
    }),
    getLogs({
      api,
      target: CL_CORE,
      fromBlock: FROM_BLOCK,
      eventAbi: events.positionRemoved,
      onlyArgs: true,
      extraKey: 'positionRemoved',
    }),
  ])

  const activeKeys = new Set()

  registerLogs.forEach(({ key }) => {
    if (key) activeKeys.add(String(key).toLowerCase())
  })

  removeLogs.forEach(({ key }) => {
    if (key) activeKeys.delete(String(key).toLowerCase())
  })

  if (!activeKeys.size) return

  const usdc = await api.call({ target: CL_CORE, abi: abi.usdc })
  let totalValueUSDC = 0n

  for (const keys of chunkArray([...activeKeys], VALUE_CHUNK_SIZE)) {
    const values = await api.call({
      target: CL_CORE,
      abi: abi.positionValueUSDC,
      params: [keys],
    })

    values.forEach(({ valueUSDC }) => {
      totalValueUSDC += BigInt(valueUSDC)
    })
  }

  api.add(usdc, totalValueUSDC)
}

module.exports = {
  methodology: 'TVL is the sum of USDC-denominated value for all currently active positions registered in EZManager CLCore on Base.',
  base: { tvl },
}