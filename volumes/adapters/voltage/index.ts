import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

const adapters = univ2Adapter({
  [CHAIN.FUSE]: "https://api.thegraph.com/subgraphs/name/voltfinance/voltage-exchange"
}, {
});

export default adapters;
