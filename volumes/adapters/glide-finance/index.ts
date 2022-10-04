import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

const adapters = univ2Adapter({
  [CHAIN.ELASTOS]: "https://api.glidefinance.io/subgraphs/name/glide/exchange"
}, {
  factoriesName: "glideFactories",
  dayData: "glideDayData"
});
adapters.volume.elastos.start = async () => 1635479215;
export default adapters;
