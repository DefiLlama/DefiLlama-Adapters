import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

const adapters = univ2Adapter({
  [CHAIN.BSC]: "https://api.thegraph.com/subgraphs/name/babyswapgraph/exchange4"
}, {
    factoriesName: "pancakeFactories",
    dayData: "pancakeDayData",
});
adapters.volume.bsc.start = async () => 1622518288;
export default adapters;
