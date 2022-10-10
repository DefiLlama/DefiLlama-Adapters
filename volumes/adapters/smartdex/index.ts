import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

export default univ2Adapter({
    [CHAIN.POLYGON]: "https://api.thegraph.com/subgraphs/name/akashzeromile/smartdex-subgraph"
}, {
});
