import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

const adapters = univ2Adapter({
    [CHAIN.MILKOMEDA]: "https://milkomeda.muesliswap.com/graph/subgraphs/name/muesliswap/exchange"
}, {
  factoriesName: "pancakeFactories",
  dayData: "pancakeDayData",
});

adapters.volume.milkomeda.start = async () => 1648427924;
export default adapters;
