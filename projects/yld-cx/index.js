const { getLogs2 } = require('../helper/cache/getLogs')

const YLD = '0x0000014563b23d9ac3ac11fe68d63cdfc19a43db'
const pairCreated = 'event PairCreated(uint256 indexed pairId, address indexed token0, address indexed token1)'

const startBlocks = { ethereum: 26167740, base: 52457955, robinhood: 85678610 }

async function tvl(api) {
  const block = await api.getBlock()
  const fromBlock = startBlocks[api.chain]
  if (block < fromBlock) return

  const pairs = await getLogs2({
    api,
    target: YLD,
    eventAbi: pairCreated,
    fromBlock,
    toBlock: block,
  })
  const tokens = [...new Set(pairs.flatMap(({ token0, token1 }) => [token0.toLowerCase(), token1.toLowerCase()]))]
  if (!tokens.length) return

  const [liabilities, fees] = await Promise.all([
    api.multiCall({ target: YLD, abi: 'function tokenLiability(address) view returns (uint256)', calls: tokens }),
    api.multiCall({ target: YLD, abi: 'function accruedProtocolFees(address) view returns (uint256)', calls: tokens }),
  ])

  tokens.forEach((token, i) => {
    const liability = BigInt(liabilities[i])
    const protocolFees = BigInt(fees[i])

    if (protocolFees > liability) {
      throw new Error(`yld.cx ${api.chain}: fees exceed liability for ${token}`)
    }

    if (liability > 0n) {
      api.add(token, (liability - protocolFees).toString())
    }
  })
}

module.exports = {
  start: '2026-10-11',
  methodology: 'User-owned ERC-20 assets held by Yield Orders: on-chain tokenLiability minus accruedProtocolFees at the snapshot block.',
  ethereum: { tvl },
  base: { tvl },
  robinhood: { tvl },
}
