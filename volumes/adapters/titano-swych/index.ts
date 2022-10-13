
import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

const adapters = univ2Adapter({
  [CHAIN.BSC]: "https://api.thegraph.com/subgraphs/name/swychfinance/exchange"
}, {
  factoriesName: "pancakeFactories",
  dayData: "pancakeDayData",
});
adapters.volume.bsc.start = async () => 1648005393;
export default adapters;
