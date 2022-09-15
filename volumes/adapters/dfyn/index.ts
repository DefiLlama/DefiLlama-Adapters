import { univ2Adapter } from "../../helper/getUniSubgraphVolume";
import { CHAIN } from "../../helper/chains";

// Not complete! Missing older versions
export default univ2Adapter({
    [CHAIN.POLYGON]: "https://api.thegraph.com/subgraphs/name/ss-sonic/dfyn-v4",
}, {});