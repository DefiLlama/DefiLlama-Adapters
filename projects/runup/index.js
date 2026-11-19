const FACTORY = '0x6a00c8Cb5Fb5aAac9C91A2649bd42a26Ca3dEeE1'

const abi = {
  launches: 'function launches(uint256) view returns (address token, address market, address vault, address schedule, address adapter, address creator, bytes32 marketId, bool shortThesis, uint8 leverage, uint8 profile, uint8 preset)',
}

async function tvl(api) {
  const quote = await api.call({ target: FACTORY, abi: 'address:quoteToken' })
  const launches = await api.fetchList({ lengthAbi: 'uint256:count', itemAbi: abi.launches, target: FACTORY })
  return api.sumTokens({ owners: launches.map((launch) => launch.market), tokens: [quote] })
}

module.exports = {
  methodology: 'TVL is the USDC held by every RunUp market contract, enumerated from the RunUp factory: bonding curve reserves, and the pool a coin graduates into, including RUNNER, the platform token, which launched through its own market. Launched tokens are excluded, as are the coins\' treasury vaults, which hold trading fees used for the perp strategy and buybacks.',
  start: '2026-10-02',
  injective: {
    tvl,
  },
}
