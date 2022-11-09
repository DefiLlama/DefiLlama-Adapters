import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

const adapters = univ2Adapter({
  [CHAIN.BITGERT]: "https://graph.icecreamswap.com/subgraphs/name/simone1999/bitgert-uniswap"
}, {});
adapters.volume.bitgert.start = async () => 1655917200;

export default adapters;
