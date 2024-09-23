# Agoric Inter Protocol Stable Token (IST) Adapter

This adapter tracks the Total Value Locked (TVL) for the Inter Protocol Stable Token (IST) on the Agoric chain.

## Overview
- **Chain**: Agoric
- **Token**: IST (Inter Protocol Stable Token)
- **Website**: https://inter.trade
- **CoinGecko ID**: inter-stable-token

## Functionality
This adapter calculates the TVL for IST by:

1. Querying data from the Agoric Subquery API (https://api.subquery.network/sq/agoric-labs/agoric-mainnet-v2).
2. Fetching information about:
   - Vault manager metrics
   - Oracle prices
   - Board auxiliaries (for decimal places)
3. Calculating the total collateral value across different asset types using BigInt for precise calculations.
4. Adjusting the collateral values based on oracle prices and decimal places.
5. Summing up the adjusted collateral values to get the total TVL.

## Implementation Details
- Uses BigInt for all calculations to ensure precision with large numbers.
- Oracle prices are stored as ratios (numerator/denominator) to avoid floating-point precision issues.
- Collateral values are adjusted based on their respective decimal places before calculation.
- The final TVL is represented as a BigInt

## Data Sources
- Vault Manager Metrics: Provides information about total collateral for each brand.
- Oracle Prices: Gives the current price data for different asset types.
- Board Auxiliaries: Provides decimal place information for each asset.

The adapter aggregates this data to calculate an accurate TVL across all collateral types in the Agoric ecosystem.
