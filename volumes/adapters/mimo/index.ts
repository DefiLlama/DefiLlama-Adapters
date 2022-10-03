import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

export default univ2Adapter({
  [CHAIN.IOTEX]: "https://graph-cache.mimo.exchange/subgraphs/name/mimo/mainnet",
}, {});
