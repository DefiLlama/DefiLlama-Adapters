import { univ2Adapter } from "../../helper/getUniSubgraphVolume";
import { CHAIN } from "../../helper/chains";

const endpoints = {
  [CHAIN.BSC]: "https://api.thegraph.com/subgraphs/name/wombat-exchange/wombat-exchange",
};

export default univ2Adapter(endpoints, {
  factoriesName: "protocols",
  dayData: "protocolDayData",
  dailyVolume: "dailyTradeVolumeUSD",
  totalVolume: "totalTradeVolumeUSD"
});
