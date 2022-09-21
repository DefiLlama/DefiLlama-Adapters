import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

const adapter = univ2Adapter({
    "wan": "https://thegraph.one/subgraphs/name/wanswap/wanswap-subgraph-3"
}, {
    factoriesName: "uniswapFactories",
    dayData: "uniswapDayData",
});
adapter.volume.wan.start = async () => 1632268798;

export default adapter;
