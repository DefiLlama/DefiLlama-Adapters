import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

const adapters = univ2Adapter({
  [CHAIN.BSC]: "https://api.thegraph.com/subgraphs/name/dinosaur-eggs/swap"
}, {
  factoriesName: "swapFactories",
  dayData: "swapDayData"
});
adapters.volume.bsc.start = async () => 1633046917;
export default adapters;
