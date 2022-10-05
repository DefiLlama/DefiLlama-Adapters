import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

const adapter = univ2Adapter({
  [CHAIN.FANTOM]: "https://graph-node.tomb.com/subgraphs/name/tombswap-subgraph"
}, {});
adapter.volume.fantom.start = async () => 1632268798;
export default adapter;
