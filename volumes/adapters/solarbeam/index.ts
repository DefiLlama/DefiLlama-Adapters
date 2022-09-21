import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

const adapter = univ2Adapter({
    "moonriver": "https://api.thegraph.com/subgraphs/name/solarbeamio/amm-v2"
},{});
adapter.volume.moonriver.start = async () => 1630903340;
export default adapter;
