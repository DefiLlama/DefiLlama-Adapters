import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

const adapter = univ2Adapter({
    [CHAIN.BSC]: "https://api.thegraph.com/subgraphs/name/officialdevteamsix/pyeswap"
}, {
    factoriesName: "pyeFactories",
    dayData: "pyeDayData",
});
adapter.volume.bsc.start = async () => 1660893036;
export default adapter;
