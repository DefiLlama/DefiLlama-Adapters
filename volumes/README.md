> ⚠️ If you would like to add a `volume` adapter please submit the PR [here](https://github.com/DefiLlama/adapters). ⚠️ 

# DEX volumes

## Test an adapter

Add the adapter to the `volumes/adapter` folder and run the test-dex command:

`npm run test-dex <adapter-name> <timestamp>`

Examples:
```
npm run test-dex 1inch
npm run test-dex 1inch 1662110960016
```

## Volume adapter

An adapter is simply an object that contains, among other attributes, a promise that returns the protocol's volume given a timestamp or a block number

A volume adapter could be either a `SimpleVolumeAdapter` or a `BreakdownVolumeAdapter`. A `BreakdownVolumeAdapter` adapter is a set of `SimpleVolumeAdapter` and is used to define adapters for a protocol that has multiple versions (I.e. Uniswap v1, v2, v3).


```
type SimpleVolumeAdapter = {
  volume: Adapter
};

type BreakdownAdapter = {
  [version: string]: Adapter
};

type Adapter = {
  [chain: string]: {
    start: () => Promise<number>
    fetch: Fetch;
    runAtCurrTime?: boolean;
    customBackfill?: Fetch;
  }
};
```



`Adapter` properties:
- `fetch`: Promise that returns the daily and total volume given a timestamp or a block number. Returns an object with the `dailyVolume` and/or `totalVolume`, the `timestamp` of the volume and the `block` of the volume. If the adapter only returns totalVolume, our servers will calculate the `s` based on previous day `totalVolume`.
```
type FetchResult = {
  block?: number;
  dailyVolume?: string;
  totalVolume: string;
  timestamp: number;
};
```
- `start`: Promise that returns a timestamp indicating the start of data availability. To indicate how far needs to be refilled.
- `customBackfill`: Promise that returns the daily and total volume given a timestamp or a block number. Used when logic to get historical volume values is different than the `fetch` promise.

### Helper functions
###### Custom backfill
For situations where the fetch function can only return `totalVolume` and can return in based on a timestamp you can use the `customBackfill` function that can be found in `volumes/helper/customBackfill`.
###### Obtaining data from subgraphs
If the data is available in a subgraph and it follows a structure similar to uniswap, you can use the folling helper functions to easily query it. More docs about it to be added soon but for now... take a look at other implementations/the code!
- `getChainVolume` from `volumes/helper/getUniSubgraphVolume`
- `getStartTimestamp` from `volumes/helper/getStartTimestamp`



### Adapter example
```typescript
import customBackfill from "../../helper/customBackfill";
import { DEFAULT_TOTAL_VOLUME_FACTORY, DEFAULT_TOTAL_VOLUME_FIELD, getChainVolume } from "../../helper/getUniSubgraphVolume";
import { CHAIN } from "../../helper/chains";
import type { ChainEndpoints, SimpleVolumeAdapter } from "../../dexVolume.type";
import type { Chain } from "@defillama/sdk/build/general";

// Subgraphs endpoints
const endpoints: ChainEndpoints = {
  [CHAIN.ETHEREUM]: "https://api.thegraph.com/subgraphs/name/dex",
  [CHAIN.POLYGON]: "https://api.thegraph.com/subgraphs/name/dex-polygon",
  [CHAIN.ARBITRUM]: "https://api.thegraph.com/subgraphs/name/dex-arbitrum",
};

// Fetch function to query the subgraphs
const graphs = getChainVolume({
  graphUrls: endpoints,
  totalVolume: {
    factory: DEFAULT_TOTAL_VOLUME_FACTORY,
    field: DEFAULT_TOTAL_VOLUME_FIELD,
  },
  dailyVolume: {
    factory: DAILY_VOLUME_FACTORY,
    field: "D_VOL_FIELD",
  },
  hasDailyVolume: false,
});

const adapter: SimpleVolumeAdapter = {
  volume: Object.keys(endpoints).reduce((acc, chain) => {
    return {
      ...acc,
      [chain]: {
        fetch: graphs(chain as Chain),
        start: async () => 1570665600,
        customBackfill: customBackfill(CHAIN.ETHEREUM, graphs),
      }
    }
  }, {} as SimpleVolumeAdapter['volume'])
};

export default adapter;

```