import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

const adapters = univ2Adapter({
  [CHAIN.BSC]: "https://api.thegraph.com/subgraphs/name/sphynxswap/exchange",
  [CHAIN.CRONOS]: "https://crnode.thesphynx.co/graph/subgraphs/name/exchange/cronos"
}, {
  factoriesName: "sphynxFactories",
  dayData: "sphynxDayData"
});

export default adapters;
