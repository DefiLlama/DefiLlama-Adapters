const { getLogs2 } = require('../helper/cache/getLogs')

const YLD = '0x00007e639751Af64b8b108c3E40b1Cd7faDdE627'
const pairCreated = 'event PairCreated(uint256 indexed pairId, address indexed token0, address indexed token1)'

const startBlocks = { ethereum: 26391743, base: 56052624, robinhood: 111707405 }

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

  const liabilities = await api.multiCall({ target: YLD, abi: 'function tokenLiability(address) view returns (uint256)', calls: tokens })

  tokens.forEach((token, i) => {
    const liability = BigInt(liabilities[i])
    if (liability > 0n) {
      api.add(token, liability.toString())
    }
  })
}

module.exports = {
  start: '2026-11-11',
  methodology: 'Yield Orders v0.4 TVL includes yld.cx user-owned assets tracked by on-chain tokenLiability.',
  ethereum: { tvl },
  base: { tvl },
  robinhood: { tvl },
}
