const { PublicKey } = require("@solana/web3.js");
const { getTokenMintFromMarketIndex, processSpotPosition, processPerpPosition, getPerpTokenMintFromMarketIndex, getVaultPublicKey } = require("./spotMarkets");
const { deserializeUserPositions } = require("./helpers");
const { getPerpMarketFundingRates } = require("./spotMarkets");
const { getMultipleAccounts } = require('../helper/solana')


module.exports = {
  timetravel: false,
  doublecounted: true,
  methodology: "Calculate sum of spot positions",
  solana: {
    tvl,
  },
};


const vaultAddresses = [
  new PublicKey("9Zmn9v5A2YWUQj47bkEmcnc37ZsYe83rsRK8VV2j1UqX"),
  new PublicKey("4KvPuh1wG8j1pLnZUC5CuqTm2a41PWNtik1NwpLoRquE")
];
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
  const accounts = await getMultipleAccounts(vaultAddresses)
  const deserializedData = accounts.map(deserializeUserPositions)
  const perpIndices = deserializedData.map(data => data.perpPositions.map(position => position.market_index)).flat()
  const perpKeys = perpIndices.map(index => getVaultPublicKey('perp_market', index))
  const perpAccounts = await getMultipleAccounts(perpKeys)
  const perpAccountMap = {}
  perpIndices.forEach((v, i) => perpAccountMap[v] = perpAccounts[i])


  for (const { spotPositions, perpPositions } of deserializedData) {
    // 
    // Process spot positions
    if (spotPositions?.length) {
      spotPositions.forEach(position => {
        const tokenMint = getTokenMintFromMarketIndex(position.market_index);
        const adjustedBalance = processSpotPosition(position);

        api.add(tokenMint, adjustedBalance);
      });
    }

    // Process perp positions
    if (perpPositions?.length) {

      perpPositions.map(async position => {
        // Handle base asset
        const baseTokenMint = getPerpTokenMintFromMarketIndex(position.market_index);
        const { baseBalance, quoteBalance } = processPerpPosition(position);
        api.add(baseTokenMint, baseBalance);
        // 
        // Handle quote asset (always USDC)
        const quoteTokenMint = getTokenMintFromMarketIndex(0);
        //
        api.add(quoteTokenMint, quoteBalance);

        const { cumulativeFundingRateLong, cumulativeFundingRateShort, } = getPerpMarketFundingRates(perpAccountMap[position.market_index]);
        const currentCumulativeFundingRate = position.base_asset_amount > 0n ? cumulativeFundingRateLong : cumulativeFundingRateShort;
        const difference = (currentCumulativeFundingRate - BigInt(position.last_cumulative_funding_rate)) / BigInt(10 ** 6);
        const fundingRatePnl = (difference * (position.base_asset_amount) / BigInt(10 ** 6));

        api.add(quoteTokenMint, fundingRatePnl);
      })
    }
  }
}

