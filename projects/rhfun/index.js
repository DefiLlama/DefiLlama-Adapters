const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs2 } = require('../helper/cache/getLogs')

// RH.fun — bonding-curve token launchpad on Robinhood Chain (4663).
// Each token launches its own BondingCurve clone that custodies the collateral
// (native ETH or USDG) until the curve reaches its target and graduates; the
// graduation tx migrates the liquidity to the chain's Uniswap V2 DEX and drains
// the curve to zero, so graduated liquidity is no longer counted here.
// Tax markets additionally accrue quote-token tax (WETH for native markets) on
// per-token TaxProcessor / Dividend clones, and optional market vaults receive
// the native market bucket — all enumerated from factory events and counted.
const FACTORY = '0x32a00Df7C511A882f3A7a18bcD69367880239726' // FACTORY_PROXY
const FROM_BLOCK = 12923899 // block of the first NewRHTokenCurveParams event

const CURVE_EVENT = 'event NewRHTokenCurveParams(address indexed addr, address indexed bondingCurve, uint256 initialTokenSupply, uint256 virtualCollateralReservesInitial, uint256 virtualTokenReservesInitial, uint256 feeBPS, uint256 mcLowerLimit, uint256 mcUpperLimit, uint256 tokensMigrationThreshold, uint256 fixedMigrationFee, uint256 firstBuyFee, uint256 targetCollectionAmount, address collateralToken)'
const TAX_EVENT = 'event NewRHTaxTokenParams(address indexed token, address indexed bondingCurve, address indexed collateralToken, address mainPool, address taxProcessor, address dividendContract, uint16 taxRateBps, uint64 taxDuration, uint64 antiFarmerDuration, uint256 minBuyBackQuote, uint16 processorFeeRateCurve, uint16 processorFeeRateDex, uint16 processorMarketBps, uint16 processorDeflationBps, uint16 processorLpBps, uint16 processorDividendBps, uint256 minimumShareBalance, address marketAddress)'
const VAULT_EVENT = 'event MarketVaultCreated(address indexed token, address indexed vaultFactory, address vault, bytes marketVaultData)'

async function tvl(api) {
  const [curveLogs, taxLogs, vaultLogs] = await Promise.all([
    getLogs2({ api, factory: FACTORY, eventAbi: CURVE_EVENT, fromBlock: FROM_BLOCK, extraKey: 'curves' }),
    getLogs2({ api, factory: FACTORY, eventAbi: TAX_EVENT, fromBlock: FROM_BLOCK, extraKey: 'tax' }),
    getLogs2({ api, factory: FACTORY, eventAbi: VAULT_EVENT, fromBlock: FROM_BLOCK, extraKey: 'vaults' }),
  ])

  const tokensAndOwners = []
  // Un-graduated curves hold their raw collateral: native ETH (collateralToken = 0x0) or USDG.
  curveLogs.forEach((log) => tokensAndOwners.push([log.collateralToken, log.bondingCurve]))
  // Tax markets accrue tax in the quote token (WETH for native markets) on TaxProcessor/Dividend clones.
  taxLogs.forEach((log) => {
    const quote = log.collateralToken === ADDRESSES.null ? ADDRESSES.robinhood.WETH : log.collateralToken
    tokensAndOwners.push([quote, log.taxProcessor])
    if (log.dividendContract !== ADDRESSES.null) tokensAndOwners.push([quote, log.dividendContract])
  })
  // Optional market vaults (gift / snowball / burn-dividend / split) receive the native market bucket.
  vaultLogs.forEach((log) => tokensAndOwners.push([ADDRESSES.null, log.vault]))

  return api.sumTokens({ tokensAndOwners })
}

module.exports = {
  methodology:
    'Counts collateral held by RH.fun market contracts on Robinhood Chain, enumerated from factory events: ETH/USDG in un-graduated bonding-curve clones (NewRHTokenCurveParams), quote-token tax accrued on per-token TaxProcessor and Dividend clones (NewRHTaxTokenParams), and native balances of market vaults (MarketVaultCreated). When a curve graduates, its liquidity migrates to the chain\'s Uniswap V2 DEX and the curve is drained to zero in the same transaction, so graduated liquidity is no longer counted here. Locked allocations of launched tokens themselves are excluded.',
  robinhood: { tvl },
}
