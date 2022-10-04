import { univ2Adapter } from "../../helper/getUniSubgraphVolume";
import { CHAIN } from "../../helper/chains";

const endpoints = {
  [CHAIN.BSC]: "https://api.thegraph.com/subgraphs/name/wombat-exchange/wombat-exchange",
};

const adapter = univ2Adapter(endpoints, {
  factoriesName: "protocols",
  dayData: "protocolDayData",
  dailyVolume: "dailyTradeVolumeUSD",
  totalVolume: "totalTradeVolumeUSD"
});

adapter.volume.bsc.start = async()=>1650243600

export default adapter