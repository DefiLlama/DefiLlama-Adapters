import { univ2Adapter } from "../../helper/getUniSubgraphVolume";
import { CHAIN } from "../../helper/chains";

const endpoints = {
  [CHAIN.BSC]: "https://api.thegraph.com/subgraphs/name/chopachom/nomiswap-subgraph-exchange",
};

const adapter = univ2Adapter(endpoints, {
  factoriesName: "nomiswapFactories",
  dayData: "nomiswapDayData",
  dailyVolume: "dailyVolumeUSD",
  totalVolume: "totalVolumeUSD"
});

adapter.volume.bsc.start = async () => 1634710338

export default adapter
