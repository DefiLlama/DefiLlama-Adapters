
import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

export default univ2Adapter({
  [CHAIN.CRONOS]: "https://gnode.photonswap.finance/subgraphs/name/dexbruce/photonswap"
}, {});
