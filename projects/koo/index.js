// Production protocol: https://app.koo.xyz/ and https://docs.koo.xyz/earn/yield-bearing-usdc
const CORE = '0xA18b67e194d4f4bADe61d4e68cd135C63C438D1d'
const USDC = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'
// Both receipt balances are denominated in six-decimal underlying USDC units.
const aArbUSDCn = '0x724dc807b04555b71ed48a6896b6f41593b8c637'
const compoundUSDC = '0x9c4ec768c28520b50860ea7a15bd7213a9ff58bf'

async function tvl(api) {
  const supported = await api.call({ target: CORE, abi: 'address[]:getSupportedAssets' })
  if (supported.some(asset => asset.toLowerCase() !== USDC.toLowerCase()))
    throw new Error('Koo collateral assets changed; update the custody/strategy mapping')

  const balances = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: [USDC, aArbUSDCn, compoundUSDC].map(target => ({ target, params: CORE })),
  })
  const total = balances.reduce((sum, balance) => sum + BigInt(balance), 0n)
  api.add(USDC, total.toString())
}

module.exports = {
  // The yield-bearing collateral is also included by Aave V3 and Compound V3.
  doublecounted: true,
  methodology: 'Counts native USDC and the underlying USDC represented by Aave V3 and Compound V3 receipt balances held by the Arbitrum core protocol. This custody backs trading collateral and the live protocol Vault. Vault LP supply, pool-value/equity views, governance tokens and the separate fee pool are not added to the same assets again.',
  arbitrum: { tvl },
}
