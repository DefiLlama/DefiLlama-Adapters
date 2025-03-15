# Oikos.cash TVL & Revenue Adapters

## Description
This adapter calculates the Total Value Locked (TVL) and revenue for Oikos.cash on Binance Smart Chain (BSC).  
- **TVL Calculation:** Prioritizes on-chain Oracle data with CoinGecko fallback for improved accuracy and independence.
- **Revenue Calculation:** Extracts data directly from the FeePool contract, with Exchanger fee rates as fallback.

## Methodology
- **TVL:** Based on the total value of Synths on BSC, prioritizing on-chain Oracle data for accuracy.  
- **Revenue:** Aggregated from fees available in the FeePool contract and swap fees collected in the Exchanger contract.

## Chain
- Binance Smart Chain (BSC).

## Oracle Provider
- Chainlink (for on-chain Oracle prices).

## Documentation
- Official Oikos Documentation: [docs.oikos.cash](https://docs.oikos.cash/)

## GitHub Org/User
- [Oikos Cash GitHub](https://github.com/oikos-cash)

## Contact
For questions or improvements, please feel free to reach out via DefiLlama’s Discord or GitHub issues.
