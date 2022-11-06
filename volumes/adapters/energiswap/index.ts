import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

export default univ2Adapter({
    [CHAIN.ENERGI]: "https://graph.energi.network/http/subgraphs/name/energi/energiswap"
}, {
    factoriesName: "energiswapFactories",
    totalVolume: "totalVolumeUSD",
    dayData: "dailyEnergiswapStatistic",
    dailyVolume: "dailyVolumeUSD"
});
