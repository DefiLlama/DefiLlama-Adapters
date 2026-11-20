const ADDRESSES = require('../helper/coreAssets.json')

// Energyblocks (EBX) token proxy on Sonic.
const EBX_TOKEN = '0x211741C81F997ca78966Ec6299Df4118789b2EE5'
const TERMS = [30, 60, 90]

// Investor USDC is forwarded to the treasury on issuance, so the contract holds ~0 USDC.
// TVL is the outstanding principal: tokens held by Active Positions times the fixed price.
async function tvl(api) {
  const [active, price] = await Promise.all([
    api.multiCall({ target: EBX_TOKEN, abi: 'function activeTokens(uint256) view returns (uint256)', calls: TERMS }),
    api.call({ target: EBX_TOKEN, abi: 'uint256:usdcPricePerToken' }),
  ])
  const tokens = active.reduce((sum, n) => sum + BigInt(n), 0n)
  api.add(ADDRESSES.sonic.USDC_e, tokens * BigInt(price))
}

module.exports = {
  methodology: 'TVL is the outstanding principal of active Energyblocks Positions: tokens held by Active Positions across all terms, times the fixed USDC price per token. Investor USDC is forwarded to the Energyblocks treasury to finance the underlying energy projects, so it is not held in the contract.',
  sonic: { tvl },
}
