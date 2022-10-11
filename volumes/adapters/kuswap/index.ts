import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

const adapters = univ2Adapter({
  [CHAIN.KCC]: "https://info.kuswap.finance/subgraphs/name/kuswap/swap",
}, {
});

export default adapters;
