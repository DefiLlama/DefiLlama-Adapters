import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

const adapters = univ2Adapter({
  [CHAIN.AVAX]: 'https://api.thegraph.com/subgraphs/name/complusnetwork/subgraph-ava',
  [CHAIN.BSC]: 'https://api.thegraph.com/subgraphs/name/complusnetwork/bsc-subgraph',
  // [CHAIN.POLYGON]: 'https://api.thegraph.com/subgraphs/name/complusnetwork/subgraph-matic',
  // [CHAIN.HECO]: 'https://hg2.bitcv.net/subgraphs/name/complusnetwork/subgraph-heco'
}, {
  factoriesName: "complusFactories",
  dayData: "complusDayData"
});

export default adapters;
