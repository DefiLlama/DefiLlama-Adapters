import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

export default univ2Adapter({
  [CHAIN.STEP]: "https://graph.step.network/subgraphs/name/stepapp/stepex"
}, {
    factoriesName: "stepExFactories",
    dayData: "stepExDayData",
});
