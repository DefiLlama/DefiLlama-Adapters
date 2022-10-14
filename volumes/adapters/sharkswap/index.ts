import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

const adapters = univ2Adapter({
  [CHAIN.SX]: "https://graph.sx.technology/subgraphs/name/sharkswap/exchange",
}, {
  factoriesName: "factories",
  dayData: "dayData",
  dailyVolume: "volumeUSD",
  totalVolume: "volumeUSD",
});

export default adapters;
