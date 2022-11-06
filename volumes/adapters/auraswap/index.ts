import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

const adapters = univ2Adapter({
  [CHAIN.POLYGON]: "https://api.thegraph.com/subgraphs/name/auraswap-dex/exchange",
}, {
  factoriesName: "factories",
  dayData: "dayData",
  dailyVolume: "volumeUSD",
  totalVolume: "volumeUSD",
});

adapters.volume.polygon.start = async () => 1654992851;
export default adapters;
