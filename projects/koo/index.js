const ADDRESSES = require('../helper/coreAssets.json')
// Production protocol: https://app.koo.xyz/ and https://docs.koo.xyz/earn/yield-bearing-usdc
const { sumTokens2 } = require('../helper/unwrapLPs')

const CORE = '0xA18b67e194d4f4bADe61d4e68cd135C63C438D1d'
const USDC = ADDRESSES.arbitrum.USDC_CIRCLE
// Both receipt balances are denominated in six-decimal underlying USDC units.
const aArbUSDCn = '0x724dc807b04555b71ed48a6896b6f41593b8c637'
const compoundUSDC = '0x9c4ec768c28520b50860ea7a15bd7213a9ff58bf'

// KFC (KryptoX Finance Coin), the protocol's own token, was added as a supported asset; it is not counted as TVL.
const KFC = '0x2e3ED33859efE1F05BB2952bD44D5146D8ef82D1'

async function tvl(api) {
  const supported = await api.call({ target: CORE, abi: 'address[]:getSupportedAssets' })
  const tokens = supported.filter(asset => asset.toLowerCase() !== KFC.toLowerCase())

  return sumTokens2({ api, owner: CORE, tokens: [...new Set([USDC, ...tokens, aArbUSDCn, compoundUSDC])] })
}

module.exports = {
  // The yield-bearing collateral is also included by Aave V3 and Compound V3.
  doublecounted: true,
  methodology: 'Counts native USDC and the underlying USDC represented by Aave V3 and Compound V3 receipt balances held by the Arbitrum core protocol. This custody backs trading collateral and the live protocol Vault. Vault LP supply, pool-value/equity views, governance tokens and the separate fee pool are not added to the same assets again.',
  arbitrum: { tvl },
}
