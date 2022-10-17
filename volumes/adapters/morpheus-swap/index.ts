import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

const adapters = univ2Adapter({
  [CHAIN.FANTOM]: "https://api.thegraph.com/subgraphs/name/daedboi/morpheus-swap"
}, {
  factoriesName: "pancakeFactories",
  dayData: "pancakeDayData",
});

adapters.volume.fantom.start = async () => 1636106400;
export default adapters;
