import { univ2Adapter } from "../../helper/getUniSubgraphVolume";
import { CHAIN } from "../../helper/chains";

/*
BROKEN! subgraph has only indexed up until Aug-11-2021 and is too slow to catch up
export default univ2Adapter({
    [CHAIN.BSC]: "https://api.bscgraph.org/subgraphs/name/bakeryswap",
  }, {
  factoriesName: "bakerySwapFactories",
  dayData: "bakerySwapDayData",
});
*/