import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

export default univ2Adapter({
  [CHAIN.OKEXCHAIN]: "https://graph.jfswap.com/subgraphs/name/jfswap/jfswap-subgraph"
}, {
    factoriesName: "jswapFactories",
    dayData: "jswapDayData",
});
