import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

export default univ2Adapter({
  [CHAIN.METIS]: "https://graph-node.tethys.finance/subgraphs/name/tethys2"
}, {
});
