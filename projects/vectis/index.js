const { getTokenMintFromMarketIndex, processSpotPosition, processPerpPosition, getPerpTokenMintFromMarketIndex, getVaultPublicKey } = require("./spotMarkets");
const { deserializeUserPositions, fetchVaultUserAddressesWithOffset, fetchVaultAddresses} = require("./helpers");
const { getPerpMarketFundingRates } = require("./spotMarkets");
const { getMultipleAccounts} = require('../helper/solana')



  module.exports = {
  timetravel: false,
  doublecounted: true,
  methodology: "Calculate sum of spot positions in vaults with unrealized profit and loss",
  solana: {
    tvl,
  },
};
/**
 * Vault Equity Calculation Formula:
 * VaultEquity = NetSpotValue + UnrealizedPnL
 * 
 * Where:
 * 1. NetSpotValue = Σ(spotPosition.scaledBalance * spotMarketPrice * direction)
 *    - spotPosition.scaledBalance: The size of the spot position
 *    - spotMarketPrice: Current market price of the asset
 *    - direction: 1 for deposits (longs), -1 for borrows (shorts)
 * 
 * 2. UnrealizedPnL = Σ(perpPosition.baseAssetAmount * oraclePrice + perpPosition.quoteAssetAmount + fundingPnL)
 *    For each perpetual position:
 *    - baseAssetAmount * oraclePrice: Current value of the base asset position (e.g., BTC, ETH, SOL)
 *    - quoteAssetAmount: Amount of quote currency (USDC) in the position
 *    - fundingPnL: (market.amm.cumulativeFundingRate - position.lastCumulativeFundingRate) * position.baseAssetAmount / FUNDING_RATE_PRECISION
 * 
 */
async function tvl(api) {

  const vaultAddresses = await fetchVaultAddresses();

  const { vaultUserAddresses, } = await fetchVaultUserAddressesWithOffset(vaultAddresses, 168);

  // Get all vault accounts first
  const accounts = await getMultipleAccounts(vaultUserAddresses)
  const deserializedData = accounts.filter((accountInfo) => !!accountInfo).map(deserializeUserPositions)

  // Collect unique market indices upfront
  const allSpotIndices = new Set()
  const allPerpIndices = new Set()
  
  deserializedData.forEach(({ spotPositions, perpPositions }) => {
    spotPositions?.forEach(pos => allSpotIndices.add(pos.market_index))
    perpPositions?.forEach(pos => allPerpIndices.add(pos.market_index))
  })

  // Batch fetch 
  const allKeys = [
    ...[...allSpotIndices].map(index => getVaultPublicKey('spot_market', index)),
    ...[...allPerpIndices].map(index => getVaultPublicKey('perp_market', index)),
  ]
  
  const allAccounts = await getMultipleAccounts(allKeys)
  
  // Create lookup maps
  const spotAccountMap = {}
  const perpAccountMap = {}
  
  let offset = 0
  ;[...allSpotIndices].forEach((index, i) => {
    spotAccountMap[index] = allAccounts[i]
    offset = i + 1
  })
  ;[...allPerpIndices].forEach((index, i) => {
    perpAccountMap[index] = allAccounts[i + offset]
  })

  // Process positions using the cached account data
  for (const { spotPositions, perpPositions } of deserializedData) {
    if (spotPositions?.length) {
      spotPositions.forEach(position => {
        const tokenMint = getTokenMintFromMarketIndex(position.market_index)
        const adjustedBalance = processSpotPosition(position, spotAccountMap[position.market_index])
        api.add(tokenMint, adjustedBalance)
      })
    }

    if (perpPositions?.length) {
      perpPositions.map(position => {
        const baseTokenMint = getPerpTokenMintFromMarketIndex(position.market_index)
        const { baseBalance, quoteBalance } = processPerpPosition(position)
        api.add(baseTokenMint, baseBalance)

        const quoteTokenMint = getTokenMintFromMarketIndex(0)
        api.add(quoteTokenMint, quoteBalance)

        const { cumulativeFundingRateLong, cumulativeFundingRateShort } = getPerpMarketFundingRates(perpAccountMap[position.market_index])
        const currentCumulativeFundingRate = position.base_asset_amount > 0n ? cumulativeFundingRateLong : cumulativeFundingRateShort
        const difference = (currentCumulativeFundingRate - BigInt(position.last_cumulative_funding_rate)) / BigInt(10 ** 6)
        const fundingRatePnl = (difference * (position.base_asset_amount) / BigInt(10 ** 6))
        api.add(quoteTokenMint, fundingRatePnl)
      })
    }
  }
}