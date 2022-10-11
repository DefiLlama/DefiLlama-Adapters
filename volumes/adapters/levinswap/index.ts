import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

const adapters = univ2Adapter({
  [CHAIN.XDAI]: "https://api.thegraph.com/subgraphs/name/levinswap/uniswap-v2"
}, {});

adapters.volume.xdai.start = async () => 1610767793;
export default adapters;
