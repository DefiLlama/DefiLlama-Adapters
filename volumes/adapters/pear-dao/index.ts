import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

export default univ2Adapter({
  [CHAIN.BSC]: "https://thegraph.peardao.io/subgraphs/name/peardao/v7"
}, {
    factoriesName: "assetsSummaries",
    totalVolume: "volume",
    dayData: "dayData",
    dailyVolume: "total",
    dailyVolumeTimestampField: "timestamp"
});
