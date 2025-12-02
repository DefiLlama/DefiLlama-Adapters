const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs } = require('../helper/cache/getLogs')

const FACTORY = '0x19798E390E69a36814B25BbBC7e75530E8a0A101'
const WETH = ADDRESSES.optimism.WETH_1
const INITIAL_LIQUIDITY = 1500_000_000_000_000_000n

const abi = {
  bondingCurveMap: "function bondingCurveMap(address) view returns (address)",
  getReserves: "function getReserves() view returns (uint256 _reserveEth, uint256 _reserveToken)",
  Deployed: "event Deployed(address indexed token, address indexed bondingCurve, address indexed creator, uint256 timestamp)",
}

async function tvl(api) {
  const logs = await getLogs({
    api,
    target: FACTORY,
    topics: ['0x0aca3d0708cc06a2b4b4bedc6fe1b5febc7f70a1c413ac1fb594bc32c911df16'],
    fromBlock: 36935850,
  })

  if (logs.length === 0) return

  const allTokens = logs.map(log => `0x${log.topics[1].slice(26)}`).map(token => token.toLowerCase())
  const tokens = [...new Set(allTokens)]
  
  const bondingCurves = await api.multiCall({ abi: abi.bondingCurveMap, calls: tokens, target: FACTORY })
  const reserves = await api.multiCall({ abi: abi.getReserves, calls: bondingCurves })
  
  let totalEth = 0n
  
  reserves.forEach(([reserveEth, reserveToken], i) => {
    const actualEth = BigInt(reserveEth) - INITIAL_LIQUIDITY
    if (actualEth > 0n) {
      totalEth += actualEth
    }
    api.add(tokens[i], reserveToken)
  })
  
  if (totalEth > 0n) {
    api.add(WETH, totalEth)
  }
}

module.exports = {
  methodology: 'Counts ETH and tokens locked in bonding curves. ETH reserves are calculated by subtracting the fake initial liquidity (1.5 ETH) from the total reserves.',
  start: 1750043447,
  base: { tvl }
}
