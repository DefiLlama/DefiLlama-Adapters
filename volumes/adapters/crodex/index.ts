import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

export default univ2Adapter({
  [CHAIN.CRONOS]: "https://infoapi.crodex.app/subgraphs/name/crograph2/crodex2"
}, {
  factoriesName: "uniswapFactories",
  dayData: "uniswapDayData"
});
