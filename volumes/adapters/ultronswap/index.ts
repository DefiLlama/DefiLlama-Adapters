import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

const adapters = univ2Adapter({
  [CHAIN.ULTRON]: "https://graph-node.ultron-rpc.net/subgraphs/name/root/ultronswap-exchange"
}, {});
adapters.volume.ultron.start = async () => 1659323793;
export default adapters;
