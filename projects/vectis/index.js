const {PublicKey } = require("@solana/web3.js");
const { getTokenMintFromMarketIndex, processSpotPosition, processPerpPosition, getPerpTokenMintFromMarketIndex   } = require("./spotMarkets");
const { fetchAndDeserializeUserPositions } = require("./helpers");
const { getPerpMarketFundingRates } = require("./spotMarkets");


module.exports = {
    timetravel: false,
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
    try {
        for (const vaultAddress of vaultAddresses) {
            const positions = await fetchAndDeserializeUserPositions(vaultAddress);
      
// 
            // Process spot positions
            if (positions?.spotPositions?.length) {
                positions.spotPositions.forEach(position => {
                    const tokenMint = getTokenMintFromMarketIndex(position.market_index);
                    const adjustedBalance = processSpotPosition(position);

                    api.add(tokenMint, adjustedBalance);
                });
            }
            // Process perp positions
            if (positions?.perpPositions?.length) {
  
                await Promise.all(positions.perpPositions.map(async position => {
                    // Handle base asset
                    const baseTokenMint = getPerpTokenMintFromMarketIndex(position.market_index);
                    const { baseBalance, quoteBalance } = processPerpPosition(position);
                    api.add(baseTokenMint, baseBalance);
                    // 
                    // Handle quote asset (always USDC)
                    const quoteTokenMint = getTokenMintFromMarketIndex(0);
                    //
                    api.add(quoteTokenMint, quoteBalance);

                    const { cumulativeFundingRateLong, cumulativeFundingRateShort,} = await getPerpMarketFundingRates(position.market_index);
                    const currentCumulativeFundingRate = position.base_asset_amount > 0n ? cumulativeFundingRateLong : cumulativeFundingRateShort;
                    const difference = (currentCumulativeFundingRate - BigInt(position.last_cumulative_funding_rate)) / BigInt(10 ** 6);
                    const fundingRatePnl = (difference * (position.base_asset_amount) / BigInt(10 ** 6));
              
// 
                    
                    
                    api.add(quoteTokenMint, fundingRatePnl);
                }));
            }
        }
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }




}

// For testing
if (require.main === module) {
    tvl().catch(console.error);
}

