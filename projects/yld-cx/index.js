const { getLogs2 } = require('../helper/cache/getLogs')

const pairCreated = 'event PairCreated(uint256 indexed pairId, address indexed token0, address indexed token1)'

const contracts = [
  // v0.3: tokenLiability includes accrued protocol fees, subtracted below
  {
    address: '0x0000014563b23d9ac3ac11fe68d63cdfc19a43db',
    subtractFees: true,
    startBlocks: { ethereum: 26167740, base: 52457955, robinhood: 85678610 },
  },
  // v0.4: tokenLiability tracks user-owned tick reserves only; fees are surplus above it
  {
    address: '0x00007e639751Af64b8b108c3E40b1Cd7faDdE627',
    subtractFees: false,
    startBlocks: { ethereum: 26391743, base: 56052624, robinhood: 111707405 },
  },
]

async function tvl(api) {
  const block = await api.getBlock()

  for (const { address, subtractFees, startBlocks } of contracts) {
    const fromBlock = startBlocks[api.chain]
    if (block < fromBlock) continue

    const pairs = await getLogs2({
      api,
      target: address,
      eventAbi: pairCreated,
      fromBlock,
      toBlock: block,
    })
    const tokens = [...new Set(pairs.flatMap(({ token0, token1 }) => [token0.toLowerCase(), token1.toLowerCase()]))]
    if (!tokens.length) continue

    const liabilities = await api.multiCall({ target: address, abi: 'function tokenLiability(address) view returns (uint256)', calls: tokens })
    const fees = subtractFees
      ? await api.multiCall({ target: address, abi: 'function accruedProtocolFees(address) view returns (uint256)', calls: tokens })
      : tokens.map(() => 0)

    tokens.forEach((token, i) => {
      const amount = BigInt(liabilities[i]) - BigInt(fees[i])
      if (amount > 0n) api.add(token, amount.toString())
    })
  }
}

module.exports = {
  start: '2026-10-11',
  methodology: 'User-owned ERC-20 assets held by Yield Orders v0.3 and v0.4, read from on-chain tokenLiability per pair token. v0.3 liability includes accrued protocol fees, which are subtracted; in v0.4 fees and donations sit above liability and are excluded by construction.',
  ethereum: { tvl },
  base: { tvl },
  robinhood: { tvl },
}
