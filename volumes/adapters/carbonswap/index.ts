
import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

const adapters = univ2Adapter({
  [CHAIN.ENERGYWEB]: "https://ewc-subgraph-production.carbonswap.exchange/subgraphs/name/carbonswap/uniswapv2",
}, {
});

adapters.volume.energyweb.start = async () => 1618446893;
export default adapters;
