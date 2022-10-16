import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

const adapters = univ2Adapter({
  [CHAIN.CALLISTO]: "https://03.callisto.network/subgraphs/name/soyswap"
}, {
  factoriesName: "soySwapFactories",
  dayData: "soySwapDayData",
});
adapters.volume.callisto.start = async () => 1634699765;

export default adapters;
