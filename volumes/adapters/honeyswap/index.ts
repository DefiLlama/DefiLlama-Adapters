import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

const adapters = univ2Adapter({
  [CHAIN.POLYGON]: " https://api.thegraph.com/subgraphs/name/1hive/honeyswap-polygon",
  [CHAIN.XDAI]: "https://api.thegraph.com/subgraphs/name/1hive/honeyswap-xdai"
}, {
    factoriesName: "honeyswapFactories",
    dayData: "honeyswapDayData",
});
adapters.volume.polygon.start = async () => 1622173831;
adapters.volume.xdai.start = async () => 1599191431;

export default adapters;
