import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

export default univ2Adapter({
    "bsc": "https://api.thegraph.com/subgraphs/name/biswapcom/exchange5"
}, {
    factoriesName: "pancakeFactories",
    dayData: "pancakeDayData",
});
