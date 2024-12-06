const { PublicKey } = require("@solana/web3.js");
const { getTokenMintFromMarketIndex, processSpotPosition, processPerpPosition, getPerpTokenMintFromMarketIndex, getVaultPublicKey } = require("./spotMarkets");
const { deserializeUserPositions } = require("./helpers");
const { getPerpMarketFundingRates } = require("./spotMarkets");
const { getMultipleAccounts } = require('../helper/solana')


module.exports = {
  timetravel: false,
  doublecounted: true,
  methodology: "Calculate sum of spot positions in vaults with unrealized profit and loss",
  solana: {
    tvl,
  },
};

const vaultUserAddresses = [
  new PublicKey("9Zmn9v5A2YWUQj47bkEmcnc37ZsYe83rsRK8VV2j1UqX"), //Vault A
  new PublicKey("4KvPuh1wG8j1pLnZUC5CuqTm2a41PWNtik1NwpLoRquE"), //Vault B
  new PublicKey("Hcs63usAc6cxWccycrVwx1mrNgNSpUZaUgFm7Lw9tSkR"), //Vault C
  new PublicKey("MzEPFp2LwCSMMPHLQsqfE7SN6xkPHZ8Uym2HfrH7g5P"), //Yield Compress A
  new PublicKey("CMiyE7M98DSPBEhQGTA6CzNodWkNuuW4y9HoocfK75nG") //Yield Compress B


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
  const accounts = await getMultipleAccounts(vaultUserAddresses)
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
      const spotIndices = spotPositions.map(position => position.market_index)
      const spotKeys = spotIndices.map(index => getVaultPublicKey('spot_market', index))
      const spotAccounts = await getMultipleAccounts(spotKeys)
      const spotAccountMap = {}
      spotIndices.forEach((v, i) => spotAccountMap[v] = spotAccounts[i])

      spotPositions.forEach(position => {
        const tokenMint = getTokenMintFromMarketIndex(position.market_index);
        const adjustedBalance = processSpotPosition(position, spotAccountMap[position.market_index]);
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

