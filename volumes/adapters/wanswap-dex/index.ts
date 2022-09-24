import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

const adapter = univ2Adapter({
    [CHAIN.WAN]: "https://thegraph.one/subgraphs/name/wanswap/wanswap-subgraph-3"
}, {
    factoriesName: "uniswapFactories",
    dayData: "uniswapDayData",
});
adapter.volume.wan.start = async () => 1632268798;

export default adapter;
