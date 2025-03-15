# Oikos.cash TVL & Revenue Adapters

## Description
This adapter calculates both the **Total Value Locked (TVL)** and **Revenue** for Oikos.cash on Binance Smart Chain (BSC). It prioritizes on-chain data for improved accuracy and independence, with CoinGecko data used only as a fallback when necessary.

## Chain
Binance Smart Chain (BSC)

## Methodology
### TVL:
- **Primary Source:** TVL is calculated by fetching Oracle prices directly from the **ExchangeRates contract** on BSC for each Oikos synth in circulation.
- **Fallback:** If Oracle data retrieval fails for a specific synth, the adapter attempts to fetch the token price via **CoinGecko's API**.
- **Aggregation:** Values are aggregated to compute the total TVL.

### Revenue:
- **Primary Source:** Derived directly from the **FeePool contract**, tracking fees collected during BSC transactions.
- **Fallback:** If FeePool data fails, the adapter calculates swap fees from the **Exchanger contract** using `feeRateForExchange` logic to capture revenue based on exchange volume.
- The final revenue calculation includes both fee-based sources to ensure accuracy.

## Notes
- The adapter dynamically adapts to data availability, prioritizing on-chain data for reliability.
- The methodology ensures alignment with DefiLlama’s best practices for accurate DeFi data reporting.

✅ Successfully tested with `yarn test tvl oikos` and `yarn test fees oikos`.
