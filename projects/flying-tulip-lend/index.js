const LENDING_LENS = {
  sonic: '0x3682168023e6ba8d1f995fda1d920827c5a8a43e',
}

const RESERVES = {
  sonic: [
    '0x29219dd400f2bf60e5a23d13be72b486d4038894', // USDC
    '0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38', // wS
    '0x5dd1a7a369e8273371d2dbf9d83356057088082c', // FT (address LendingLens is configured to key on)
    '0xe5da20f15420ad15de0fa650600afc998bbe3955', // stS
    '0xf7d85ec4e7710f71992752eac2111312e73e9c9c', // ftUSD
    '0x50c42deacd8fc9773493ed674b675be577f2634b', // WETH
    '0x0555e30da8f98308edb960aa94c0db47230d2b9c', // WBTC
  ],
}

const ASSET_STATE_ABI =
  'function assetState(address) view returns (uint256 cash, uint256 borrows, uint256 reserves, uint256 utilWad)'

async function fetchStates(api) {
  const reserves = RESERVES[api.chain]
  const states = await api.multiCall({
    target: LENDING_LENS[api.chain],
    abi: ASSET_STATE_ABI,
    calls: reserves,
  })
  states.forEach((state, i) => {
    if (!state) throw new Error(`Missing LendingLens assetState for ${api.chain}:${reserves[i]}`)
  })
  return { reserves, states }
}

async function tvl(api) {
  const { reserves, states } = await fetchStates(api)
  reserves.forEach((token, i) => {
    const s = states[i]
    const supplied = BigInt(s.cash) + BigInt(s.borrows)
    api.add(token, supplied.toString())
  })
}

async function borrowed(api) {
  const { reserves, states } = await fetchStates(api)
  reserves.forEach((token, i) => {
    api.add(token, states[i].borrows.toString())
  })
}

module.exports = {
  methodology:
    'TVL: sum of cash + borrows per reserve from LendingLens.assetState(). Borrowed: sum of borrows per reserve.',
  sonic: { tvl, borrowed },
}
