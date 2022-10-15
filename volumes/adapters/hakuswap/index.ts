import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

export default univ2Adapter({
  [CHAIN.AVAX]: "https://api.thegraph.com/subgraphs/name/smartcookie0501/hakuswap-subgraph"
}, {
});
