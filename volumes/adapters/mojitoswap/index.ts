import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

const endpoints = {
  [CHAIN.KCC]: "https://thegraph.kcc.network/subgraphs/name/mojito/swap",
};

const adapter = univ2Adapter(endpoints, {
  factoriesName: "uniswapFactories",
  dayData: "uniswapDayData",
  dailyVolume: "dailyVolumeUSD",
  totalVolume: "totalVolumeUSD"
});

adapter.volume.kcc.start = async () => 1634200191;

export default adapter
