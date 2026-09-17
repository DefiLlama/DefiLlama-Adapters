const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs2 } = require('../helper/cache/getLogs')

// ARK Launch (ark-ai.xyz) — token launchpad on Arc (Circle's USDC-gas L1, chainId 5042).
// Every launch creates a Uniswap V3 1% USDC pool and locks the LP NFT in the FeeLocker forever (no withdraw path),
// so the USDC sitting in those pools is the protocol's locked value. Two LaunchFactory generations are live:
// gen1 (own V3 deployment) and gen2 (on the official Uniswap V3 factory); both still hold trading tokens.
const USDC = '0x3600000000000000000000000000000000000000' // Arc native USDC ERC-20 interface (6 decimals)
const FACTORIES = [
  { address: '0x3d0B83e115205EDf37e48A8EB6d92e2C7492A00C', fromBlock: 21117455 }, // gen1
  { address: '0x9B9A136d04E8E19a934de062F0FBB929b3C7AEdb', fromBlock: 21170619 }, // gen2
]
const TOKEN_LAUNCHED = 'event TokenLaunched(address indexed token, address indexed deployer, address indexed pool, uint256 positionId, bool isToken0, uint256 restrictionsEndBlock, uint256 graduationThreshold, uint256 initialBuyUsdc, uint256 creationFeePaid)'

async function tvl(api) {
  const pools = []
  for (const f of FACTORIES) {
    const logs = await getLogs2({ api, target: f.address, eventAbi: TOKEN_LAUNCHED, fromBlock: f.fromBlock })
    logs.forEach((l) => pools.push(l.pool))
  }
  // launched tokens are the protocol's own tokens → excluded; only the USDC side counts
  return sumTokens2({ api, owners: pools, tokens: [USDC] })
}

module.exports = {
  methodology: 'Each launch on ARK seeds a Uniswap V3 USDC pool whose LP position is locked in the FeeLocker contract with no withdrawal function. TVL is the USDC held by those pools, enumerated from the TokenLaunched events of both LaunchFactory generations. The launched tokens themselves are not counted.',
  start: '2026-09-16',
  arc: { tvl },
}
