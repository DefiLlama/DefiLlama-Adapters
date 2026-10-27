const FACTORY = '0x6a00c8Cb5Fb5aAac9C91A2649bd42a26Ca3dEeE1'
const PLATFORM_PRESET = 3

const abi = {
  launches: 'function launches(uint256) view returns (address token, address market, address vault, address schedule, address adapter, address creator, bytes32 marketId, bool shortThesis, uint8 leverage, uint8 profile, uint8 preset)',
}

async function getLaunches(api) {
  const quote = await api.call({ target: FACTORY, abi: 'address:quoteToken' })
  const launches = await api.fetchList({ lengthAbi: 'uint256:count', itemAbi: abi.launches, target: FACTORY })
  const isPlatform = (launch) => Number(launch.preset) === PLATFORM_PRESET
  return { quote, launches, isPlatform }
}

async function tvl(api) {
  const { quote, launches, isPlatform } = await getLaunches(api)
  const owners = launches.flatMap((launch) => isPlatform(launch) ? [launch.vault] : [launch.market, launch.vault])
  return api.sumTokens({ owners, tokens: [quote] })
}

async function pool2(api) {
  const { quote, launches, isPlatform } = await getLaunches(api)
  const owners = launches.filter(isPlatform).map((launch) => launch.market)
  return api.sumTokens({ owners, tokens: [quote] })
}

module.exports = {
  methodology: 'TVL is the USDC held by the RunUp market contracts of community coins (bonding curve reserves, and the pool a coin graduates into) and by every coin\'s treasury vault that funds its perp strategy, enumerated from the RunUp factory. Launched tokens are excluded. Pool2 is the USDC in the market of RUNNER, the RunUp platform token.',
  start: '2026-10-02',
  injective: {
    tvl,
    pool2,
  },
}
