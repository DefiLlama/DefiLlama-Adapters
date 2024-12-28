# Liquidation Level Adapters

## How it works

A liquidation level adapter iterates through all open positions on a lending/CDP platform and calculates the liquidation prices of all those positions in regard of their collateral assets.

Each adapter is scoped to a protocol. The shape of the adapter's output `LiquidationAdapter` is:

```typescript
interface LiquidationAdapter {
  // chain name
  [chain: string]: {
    liquidations: () => Promise<Liq[]>;
  };
}

interface Liq {
  owner: string; // owner of this liquidatable position
  liqPrice: number; // liquidation price in USD
  collateral: string; // collateral asset address with prefix, eg `ethereum:0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2`
  collateralAmount: string; // native, non-decimal adjusted token amount, eg 1 ETH will be `"1000000000000000000"`
  extra?: {
    displayName?: string; // name of owner to be displayed on positions inspector
    url: string; // link to "spy" inspector provided by the protocol, or blockchain explorer
  };
}
```

## Examples and references

You may refer to the Aave V2 and Angle Protocol adapter for examples of how multi-chain protocols are handled.

For a complete onchain (non-subgraph) adapter, you may refer to the MakerDAO adapter.

For a hybrid approach using both onchain and indexer data, you may refer to the Compound V2 adapter.

## Caveat

Since all adapter are run in AWS Lambdas, it is essential to make sure your adapter does not take more than 15min to return the result as it's the hard limit set by AWS.

## Test an adapter

Run the following command in the repository root:

```bash
npx ts-node ./liquidations/test.ts ./liquidations/<protocol-name>/index.ts
```

## Note

Since the liquidations dashboard is mostly designed to showcase levels where huge liquidations might happen for people to better hedge their leveraged positions, we'd prefer to only list protocols with market moving potentials to reduce the noise on the UI.

We appreciate PRs for protocols of any size, and the liquidation levels data will all be tracked on the backend. However, smaller protocols may get aggregated into a series called `Others` in the chart on the frontend.
