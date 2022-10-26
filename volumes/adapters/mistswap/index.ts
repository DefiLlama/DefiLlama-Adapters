import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

const adapters = univ2Adapter({
  [CHAIN.SMARTBCH]: "https://thegraph.mistswap.fi/subgraphs/name/mistswap/exchange"
}, {
  factoriesName: "factories",
  totalVolume: "volumeUSD",
  dayData: "dayData",
  dailyVolume: "volumeUSD",
  dailyVolumeTimestampField: "date"
});

adapters.volume.smartbch.start = async () => 1633220803;
export default adapters;
