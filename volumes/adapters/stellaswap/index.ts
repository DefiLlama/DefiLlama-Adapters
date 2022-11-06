import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

const adapters = univ2Adapter({
  [CHAIN.MOONBEAN]: "https://api.thegraph.com/subgraphs/name/stellaswap/stella-swap"
}, {});
adapters.volume.moonbeam.start = async () => 1641960253;
export default adapters;
