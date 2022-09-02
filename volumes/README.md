# DEX volumes

> **_NOTE:_** Under developement.

## Test an adapter

`npm run test-dex 1inch`

## Using an adapter

The response of an adapter is

```
type FetchResult = {
  block?: number;
  dailyVolume?: string;
  totalVolume: string;
  timestamp: number;
};
```

A DEX adapter could be either simple `DexVolumeAdapter` or a `DexBreakdownAdapter`. A `DexBreakdownAdapter` adapter is a set of `DexVolumeAdapter` and is used to define the adapters for a DEX that has multiple versions (I.e. Uniswap v1, v2, v3).

```
type VolumeAdapter = {
  [chain: string]: {
    start: () => Promise<number>
    fetch: Fetch;
    customBackfill?: Fetch;
  };
};

type DexVolumeAdapter = {
  volume: VolumeAdapter;
};

type DexBreakdownAdapter = {
  breakdown: {
    [version: string]: VolumeAdapter
  };
};
```

`VolumeAdapter` properties:

- `start`: Promise returning the start timestamp of the data
- `fetch`: Promise that calculates the daily and total volume
- `customBackfill`: Promise used to custom backfill. For situations where `fetch` promise can´t return historical data given.
