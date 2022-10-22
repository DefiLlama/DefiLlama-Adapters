
import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

const adapters = univ2Adapter({
  [CHAIN.POLYGON]: "https://api.thegraph.com/subgraphs/name/agelesszeal/gravity-analytics",
}, {
});

adapters.volume.polygon.start = async () => 1629419058;
export default adapters;
