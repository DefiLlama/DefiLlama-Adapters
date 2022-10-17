import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

const adapters = univ2Adapter({
  [CHAIN.FINDORA]: "https://graph.fairyswap.finance/subgraphs/name/findora/fairy"
}, {
  factoriesName: "fairyFactories",
  dayData: "fairyDayData",
});

adapters.volume.findora.start = async () => 1647684000;
export default adapters;
