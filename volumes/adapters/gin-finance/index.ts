import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

const adapters = univ2Adapter({
    [CHAIN.BOBA]: "https://api.thegraph.com/subgraphs/name/gindev2/gin-subgraph"
}, {
});

adapters.volume.boba.start = async () => 1653525524;
export default adapters;
