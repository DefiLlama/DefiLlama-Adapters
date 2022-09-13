import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

export default univ2Adapter({
    "bsc": "https://api.thegraph.com/subgraphs/name/pangolindex/exchange"
}, {
    factoriesName: "pangolinFactories",
    dayData: "pangolinDayData",
});
