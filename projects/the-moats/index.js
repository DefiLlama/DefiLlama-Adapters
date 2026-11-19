const config = {
  avax: {
    factory: '0xD0b5249EA2f93E54B90ff0737B4d78AA13a222BC',
  },
  robinhood: {
    factory: '0x5CffC369eD14BFcD730031B137FbCEccd0a49560',
  },
  monad: {
    factory: '0xcd1901A5AB6CaA8D706D44009609f3c0E04760C4',
  },
  bsc: {
    factory: '0xcd1901A5AB6CaA8D706D44009609f3c0E04760C4',
  },
  base: {
    factory: '0xcd1901A5AB6CaA8D706D44009609f3c0E04760C4',
  }
}

async function tvl(api) {
  const { factory } = config[api.chain] || {}
  if (!factory) return

  // Fetch all deployed moat contracts from the factory
  const moats = await api.call({
    target: factory,
    abi: 'address[]:getAllDeployedContracts',
  })

  if (!moats || moats.length === 0) return

  // Fetch the staking token configured for each moat
  const stakingTokens = await api.multiCall({
    calls: moats,
    abi: 'address:stakingToken',
  })

  // Tally the balance of each staking token held in its corresponding moat contract
  return api.sumTokens({ tokensAndOwners2: [stakingTokens, moats] })
}

module.exports = {
  start: '2025-03-01',
  methodology:
    'TVL counts the total value of staking tokens deposited and locked across all Moats',
}

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl }
})
