import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

export default univ2Adapter({
  [CHAIN.FUNCTIONX]: "https://graph-node.functionx.io/subgraphs/name/subgraphFX2"
}, {
  factoriesName: "fxswapFactories",
  dayData: "fxswapDayData",
});
