import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

const endpoints = {
  [CHAIN.ETHEREUM]: "https://api.thegraph.com/subgraphs/name/shibaswaparmy/exchange",
};

const adapter = univ2Adapter(endpoints, {
  factoriesName: "factories",
  dayData: "dayData",
  dailyVolume: "volumeUSD",
  totalVolume: "volumeUSD"
});

adapter.volume.ethereum.start = async () => 1625566975;

export default adapter
