import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

export default univ2Adapter({
    [CHAIN.HECO]: "https://api2.makiswap.com/subgraphs/name/maki-mainnet/exchange"
}, {
  factoriesName: "pancakeFactories",
  dayData: "pancakeDayData"
});
