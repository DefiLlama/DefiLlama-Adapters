import { univ2Adapter } from "../../helper/getUniSubgraphVolume";
import { CHAIN } from "../../helper/chains";

export default univ2Adapter({
  [CHAIN.POLYGON]: "https://api.thegraph.com/subgraphs/name/polymmfinance/exchang"
}, {
  factoriesName: "pancakeFactories",
  dayData: "pancakeDayData"
});
