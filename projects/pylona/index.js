const ADDRESSES = require('../helper/coreAssets.json')

// Pylona issuer contracts (proxies) on Sonic, one per issuer.
const ISSUER_CONTRACTS = {
  energyblocks: '0x211741C81F997ca78966Ec6299Df4118789b2EE5',
}

// Terms in days. activeTokens returns 0 for a term that doesn't exist,
// so terms can be listed here before they go live.
const TERMS = [30, 60, 90, 120, 180, 270, 360]

// Investor USDC is transferred to the issuer's treasury on issuance, so the contracts hold ~0 USDC.
// TVL is the outstanding principal: tokens in active positions times the fixed price, per issuer contract.
async function tvl(api) {
  for (const contract of Object.values(ISSUER_CONTRACTS)) {
    const [active, price] = await Promise.all([
      api.multiCall({ target: contract, abi: 'function activeTokens(uint256) view returns (uint256)', calls: TERMS }),
      api.call({ target: contract, abi: 'uint256:usdcPricePerToken' }),
    ])
    const tokens = active.reduce((sum, n) => sum + BigInt(n), 0n)
    api.add(ADDRESSES.sonic.USDC_e, tokens * BigInt(price))
  }
}

module.exports = {
  methodology: 'TVL is the outstanding principal of active positions on Pylona across all issues: the number of tokens in active positions times the fixed USDC price per token. Investor USDC is transferred directly to the treasury of the issuer of the relevant issue (currently Energyblocks for EBX01), so it is not held in the Pylona contract.',
  sonic: { tvl },
}