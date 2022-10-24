import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

export default univ2Adapter({
  [CHAIN.FANTOM]: "https://api.thegraph.com/subgraphs/name/theothercrypto/protofi-dex-fantom",
}, {
  factoriesName: "pancakeFactories",
  dayData: "pancakeDayData",
});
