import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

const adapters = univ2Adapter({
  [CHAIN.CELO]: "https://api.thegraph.com/subgraphs/name/ubeswap/ubeswap"
}, {
  factoriesName: "ubeswapFactories",
  dayData: "ubeswapDayData",
});
adapters.volume.celo.start = async () => 1614574153;

export default adapters;
