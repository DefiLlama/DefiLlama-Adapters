import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

const adpters = univ2Adapter({
  [CHAIN.BSC]: "https://api.thegraph.com/subgraphs/name/daomaker/bsc-amm"
}, {
  factoriesName: "pancakeFactories",
  dayData: "pancakeDayData",
});
adpters.volume.bsc.start = async () => 1663921255;
export default adpters;
