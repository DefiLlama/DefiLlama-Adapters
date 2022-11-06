import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

export default univ2Adapter({
  [CHAIN.TOMBCHAIN]: "https://graph-node.lif3.com/subgraphs/name/lifeswap"
}, {
});
