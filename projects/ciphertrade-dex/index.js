// CipherTrade DEX on COTI (CipherDEX Protocol, chain 2632500).
const FACTORIES = [
  { address: '0x1909751000de0d15f81394b47eca1931184d51e0', fromBlock: 9437576 }, // Mode 0
  { address: '0x418df4557ffc1d8f568b3583936a6cfaec543a91', fromBlock: 9886358 }, // transparent Mode 3
]
const PUBLIC_BOOK = '0xff3372d73131d56f4bc7ad2fc8545b0316d0a1ce'
const BOOK_FROM_BLOCK = 9884872

const ABIS = {
  allPoolsLength: 'uint256:allPoolsLength',
  allPools: 'function allPools(uint256) view returns (address)',
  initialized: 'bool:initialized',
  token0: 'address:token0',
  token1: 'address:token1',
  reserves: 'function activeReserves() view returns (uint256 reserve0, uint256 reserve1)',
  escrow: 'function totalEscrowed(address token) view returns (uint256)',
}

async function tvl(api) {
  const factories = FACTORIES.filter(({ fromBlock }) => !api.block || api.block >= fromBlock)
  const discovered = await Promise.all(factories.map(({ address }) => api.fetchList({
    target: address, lengthAbi: ABIS.allPoolsLength, itemAbi: ABIS.allPools,
  })))
  const pools = [...new Set(discovered.flat().map(address => address.toLowerCase()))]
  if (!pools.length) return

  const [token0s, token1s, initialized, reserves] = await Promise.all([
    api.multiCall({ abi: ABIS.token0, calls: pools }),
    api.multiCall({ abi: ABIS.token1, calls: pools }),
    api.multiCall({ abi: ABIS.initialized, calls: pools }),
    api.multiCall({ abi: ABIS.reserves, calls: pools }),
  ])

  pools.forEach((_, i) => {
    if (!initialized[i]) return // Protected reservations are not yet funded liquidity.
    api.add(token0s[i], reserves[i][0])
    api.add(token1s[i], reserves[i][1])
  })

  if (api.block && api.block < BOOK_FROM_BLOCK) return
  // Order-book input escrow, read for every token the factories list.
  const tokens = [...new Set([...token0s, ...token1s])]
  const escrowed = await api.multiCall({ target: PUBLIC_BOOK, abi: ABIS.escrow, calls: tokens })
  api.add(tokens, escrowed)
}

module.exports = {
  methodology: 'Counts on-chain active reserves in initialized public Mode 0 and transparent private Mode 3 pools, and maker deposits still escrowed in the public matching order book. Excludes protocol fees, unbacked/surplus assets, native execution bounties, and confidential Mode 1/2 pools and private order-book balances.',
  start: '2026-09-20',
  coti: { tvl },
}
