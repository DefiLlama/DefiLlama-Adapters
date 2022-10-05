import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

const adapters = univ2Adapter({
  [CHAIN.VELAS]: "https://thegraph3.wagyuswap.app/subgraphs/name/wagyu"
}, {
  factoriesName: "pancakeFactories",
  dayData: "pancakeDayData"
});
adapters.volume.velas.start = async () => 1635653053;
export default adapters;
