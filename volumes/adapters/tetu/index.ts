import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

const adapters = univ2Adapter({
  [CHAIN.POLYGON]: "https://api.thegraph.com/subgraphs/name/tetu-io/tetu-swap"
}, {
});

adapters.volume.polygon.start = async () => 1634863038;
export default adapters;
