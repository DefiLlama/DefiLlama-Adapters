const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  optimism: {
    pool: '0xca689828854a422CF1f778be03CA80549408F620',
    fromBlock: 150294733,
    start: '2026-04-14',
  },
  soneium: {
    pool: '0x8e11dc9a3579abfc0ecfbfb70be36808dee59e6d',
    fromBlock: 21888033,
    start: '2026-04-23',
  },
  base: {
    pool: '0x71A0fD3C76E3E937d8275A3cb6a467b70123bD40',
    fromBlock: 50794242,
    start: '2026-09-02',
  },
}

async function tvl(api) {
  const { pool, fromBlock } = config[api.chain]
  if (await api.getBlock() < fromBlock) return {}

  const registry = await api.call({ target: pool, abi: 'address:tokenRegistry' })
  const count = await api.call({ target: registry, abi: 'function nextId() view returns (uint16)' })
  // nextId is the last assigned ID; token IDs start at 1.
  const tokens = await api.multiCall({
    target: registry,
    abi: 'function tokenOf(uint16) view returns (uint8 tokenType, address tokenAddress, uint256 tokenSubId)',
    calls: Array.from({ length: Number(count) }, (_, i) => i + 1),
    field: 'tokenAddress',
  })

  return sumTokens2({ api, owner: pool, tokens })
}

module.exports = {
  // Morpho vault shares in the pools overlap with Morpho's TVL.
  doublecounted: true,
  methodology: 'Counts registered ERC-20 balances in Privacy Boost pools, including pending deposits and vault shares. Portal funds are included once swept into a pool.',
}

Object.entries(config).forEach(([chain, { start }]) => {
  module.exports[chain] = { start, tvl }
})
