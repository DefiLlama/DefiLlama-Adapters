const ADDRESSES = require('../helper/coreAssets.json')

// Pylona issuer contracts (proxies) on Sonic, one per issuer.
const ISSUER_CONTRACTS = {
  energyblocks: '0x211741C81F997ca78966Ec6299Df4118789b2EE5',
}

// Terms in days.
const TERMS = [30, 60, 90]

// Investor USDC is forwarded to the issuer's treasury on issuance, so the contracts hold no USDC.
// Borrowed is the outstanding principal: tokens in active positions times the fixed price.
async function borrowed(api) {
  for (const contract of Object.values(ISSUER_CONTRACTS)) {
    const active = await api.multiCall({ target: contract, abi: 'function activeTokens(uint256) view returns (uint256)', calls: TERMS })
    const price = await api.call({ target: contract, abi: 'uint256:usdcPricePerToken' })
    const tokens = active.reduce((sum, n) => sum + BigInt(n), 0n)
    api.add(ADDRESSES.sonic.USDC_e, tokens * BigInt(price))
  }
}

module.exports = {
  methodology: 'Investor USDC is forwarded to the issuer, so nothing is held on-chain and TVL is zero. Borrowed is the outstanding principal from the contract ledger: tokens in active positions times the fixed USDC price. The owner can issue positions for value settled off-chain.',
  sonic: { tvl: () => ({}), borrowed },
}
