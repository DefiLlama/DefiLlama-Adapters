import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

export default univ2Adapter({
    [CHAIN.BSC]: "https://api.thegraph.com/subgraphs/name/radioshackcreator/exchange-bsc",
    [CHAIN.POLYGON]: "https://api.thegraph.com/subgraphs/name/radioshackcreator/exchange-polygon",
    [CHAIN.ETHEREUM]: "https://api.thegraph.com/subgraphs/name/radioshackcreator/exchange-ethereum",
    [CHAIN.AVAX]: "https://api.thegraph.com/subgraphs/name/radioshackcreator/exchange-avalanche",
    [CHAIN.FANTOM]: "https://api.thegraph.com/subgraphs/name/radioshackcreator/exchange-fantom"
}, {
    factoriesName: "radioShackFactories",
    dayData: "radioShackDayData",
});
