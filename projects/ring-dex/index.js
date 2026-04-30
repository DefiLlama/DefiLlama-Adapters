const fewFactoryConfig = {
  ethereum: { factory: '0x7D86394139bf1122E82FDF45Bb4e3b038A4464DD' },
  blast: { factory: '0x455b20131D59f01d082df1225154fDA813E8CeE9' },
  bsc: { factory: '0xEeE400Eabfba8F60f4e6B351D8577394BeB972CD' },
  base: { factory: '0xb3Ad7754f363af676dC1C5be40423FE538a47920' },
  arbitrum: { factory: '0x974Cc3F3468cd9C12731108148C4DABFB5eE556F' },
  hyperliquid: { factory: '0x6B65ed7315274eB9EF06A48132EB04D808700b86' }
}

const factoryConfig = {
  ethereum: { factory: '0xeb2A625B704d73e82946D8d026E1F588Eed06416' },
  blast: { factory: '0x24F5Ac9A706De0cF795A8193F6AB3966B14ECfE6' },
  bsc: { factory: '0x4De602A30Ad7fEf8223dcf67A9fB704324C4dd9B' },
  base: { factory: '0x9BfFC3B30D6659e3D84754cc38865B3D60B4980E' },
  arbitrum: { factory: '0x1246Fa62467a9AC0892a2d2A9F9aafC2F5609442' },
  hyperliquid: { factory: '0x4AfC2e4cA0844ad153B090dc32e207c1DD74a8E4' },
}

module.exports = {
  methodology: 'TVL is the sum of Ring Swap pair reserves. Few-wrapped reserves are converted to their proportional underlying asset balances using on-chain wrapper balances and total supply.',
}

Object.keys(fewFactoryConfig).forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => {
      const fewTokens = await api.fetchList({ lengthAbi: 'allWrappedTokensLength', itemAbi: 'allWrappedTokens', target: fewFactoryConfig[chain].factory })
      const pairs = await api.fetchList({ lengthAbi: 'allPairsLength', itemAbi: 'allPairs', target: factoryConfig[chain].factory })
      const token0s = await api.multiCall({ abi: 'address:token0', calls: pairs })
      const token1s = await api.multiCall({ abi: 'address:token1', calls: pairs })
      const allTokens = token0s.concat(token1s)
      const wrappedUnderlyings = await api.multiCall({ abi: 'address:token', calls: allTokens, permitFailure: true })
      wrappedUnderlyings.forEach((underlying, i) => {
        if (underlying) fewTokens.push(allTokens[i])
      })
      const fewTokenSet = new Set(fewTokens.map(normalize))
      const tokenPairs = pairs.flatMap((pair, i) => [[token0s[i], pair], [token1s[i], pair]])
      const pairBalances = await api.multiCall({ abi: 'erc20:balanceOf', calls: tokenPairs.map(([target, pair]) => ({ target, params: [pair] })) })
      const balances = {}

      tokenPairs.forEach(([token], i) => {
        addBalance(balances, token, pairBalances[i])
      })
      await unwrapFewBalances(api, balances, fewTokenSet)
      Object.entries(balances).forEach(([token, balance]) => api.add(token, balance.toString()))
    }
  }
});

async function unwrapFewBalances(api, balances, fewTokenSet) {
  for (let depth = 0; depth < 6; depth++) {
    const wrappedTokens = Object.keys(balances).filter(token => fewTokenSet.has(token) && balances[token] > 0n)
    if (!wrappedTokens.length) return;

    const fewTokenInfo = await getFewTokenInfo(api, wrappedTokens)
    let unwrapped = false

    wrappedTokens.forEach(token => {
      const balance = balances[token]
      delete balances[token]

      const info = fewTokenInfo[token]
      if (!info) return;
      const supply = BigInt(info.supply)
      if (supply === 0n) return;

      const underlying = normalize(info.underlying)
      if (underlying === token) return;
      addBalance(balances, underlying, balance * BigInt(info.underlyingBalance) / supply)
      unwrapped = true
    })

    if (!unwrapped) return;
  }
}

async function getFewTokenInfo(api, fewTokens) {
  const [underlyings, supplies] = await Promise.all([
    api.multiCall({ abi: 'address:token', calls: fewTokens }),
    api.multiCall({ abi: 'erc20:totalSupply', calls: fewTokens }),
  ])
  const validTokens = fewTokens
    .map((wrapper, i) => ({ wrapper, underlying: underlyings[i], supply: supplies[i] }))
    .filter(({ underlying, supply }) => underlying && supply)
  if (!validTokens.length) return {}
  const underlyingBalances = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: validTokens.map(({ wrapper, underlying }) => ({ target: underlying, params: [wrapper] })),
  })

  return Object.fromEntries(validTokens.map((token, i) => [
    normalize(token.wrapper),
    { ...token, underlyingBalance: underlyingBalances[i] }
  ]))
}

function normalize(address) {
  return address.toLowerCase()
}

function addBalance(balances, token, amount) {
  amount = BigInt(amount ?? 0)
  if (amount === 0n) return;
  const normalizedToken = normalize(token)
  balances[normalizedToken] = (balances[normalizedToken] ?? 0n) + amount
}
