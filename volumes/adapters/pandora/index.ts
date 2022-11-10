import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

const adapters = univ2Adapter({
  [CHAIN.BSC]: "https://graphql.pandora.digital/subgraphs/name/pandora3"
}, {
  factoriesName: "pandoraFactories",
  dayData: "pandoraDayData",
});

adapters.volume.bsc.start = async () => 1652757593;
export default adapters;
