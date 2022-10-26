import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

export default univ2Adapter({
    [CHAIN.SYSCOIN]: "https://graph.pegasys.finance/subgraphs/name/pollum-io/pegasys"
}, {
    factoriesName: "pegasysFactories",
    dayData: "pegasysDayData",
});
