# Oikos.cash TVL & Revenue Adapters

This adapter calculates TVL and fees for the Oikos protocol on BNB Chain using on-chain data. Unlike the Synthetix adapter, which relies on an off-chain endpoint, Oikos requires direct blockchain queries for accurate results.

Methodology
TVL Calculation:
TVL is calculated by summing the totalSupply() of all relevant Synth contracts. Each Synth’s supply is retrieved directly from the blockchain and converted to USD values.

Fees Calculation:
Fees are calculated using the totalFeesAvailable() function from the Oikos FeePool contract. This ensures accurate data by querying the chain directly.

Contracts Used
Synth Contracts:
These contracts track the total supply of Oikos synthetic assets. Their addresses are included in the adapter's logic.
FeePool Contract:
The FeePool contract is queried for accumulated protocol fees.
Why This Change?
The previous adapter attempted to follow the Synthetix logic, relying on an off-chain API endpoint. Since Oikos does not have a similar API, we have transitioned to direct on-chain data retrieval for accurate results.

Testing
The adapter has been tested locally using the provided test script.
Both TVL and Fees calculations are now returning meaningful results
