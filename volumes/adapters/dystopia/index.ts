import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

const adapters = univ2Adapter({
  [CHAIN.POLYGON]: "https://api.thegraph.com/subgraphs/name/dystopia-exchange/dystopia"
}, {});
adapters.volume.polygon.start = async () => 1652932015;
export default adapters;
