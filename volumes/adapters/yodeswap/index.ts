import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

export default univ2Adapter({
  [CHAIN.DOGECHAIN]: "https://graph.yodeswap.dog/subgraphs/name/yodeswap"
}, {});
