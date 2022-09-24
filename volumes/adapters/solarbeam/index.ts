import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

const adapter = univ2Adapter({
    [CHAIN.MOONRIVER]: "https://api.thegraph.com/subgraphs/name/solarbeamio/amm-v2"
},{});
adapter.volume.moonriver.start = async () => 1630903340;
export default adapter;
