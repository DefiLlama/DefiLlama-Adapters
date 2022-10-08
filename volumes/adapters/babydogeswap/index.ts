import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

const adapters = univ2Adapter({
  [CHAIN.BSC]: "https://graph-bsc-mainnet.babydoge.com/subgraphs/name/babydoge/exchange"
}, {
  factoriesName: "babyDogeFactories",
  dayData: "factoryDayData",
});

adapters.volume.bsc.start = async () => 1661780137;
export default adapters;
