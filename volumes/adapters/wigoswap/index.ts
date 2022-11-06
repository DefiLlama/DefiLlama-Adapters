import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

export default univ2Adapter({
  [CHAIN.FANTOM]: "https://api.thegraph.com/subgraphs/name/wigoswap/exchange2"
}, {
  factoriesName: "wigoswapFactories",
  dayData: "wigoDayData",
});
