import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

export default univ2Adapter({
  [CHAIN.CONFLUX]: "https://graphql.swappi.io/subgraphs/name/swappi-dex/swappi"
}, {
});
