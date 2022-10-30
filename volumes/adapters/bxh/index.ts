import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

const adapters = univ2Adapter({
  [CHAIN.BSC]: "https://api.thegraph.com/subgraphs/name/privatelabs-chainx/bxhbnb",
  [CHAIN.ETHEREUM]: "https://api.thegraph.com/subgraphs/name/privatelabs-chainx/bxheth",
  // [CHAIN.AVAX]: "https://api.thegraph.com/subgraphs/name/privatelabs-chainx/bxhavax", not current daily volume
}, {});

adapters.volume.bsc.start = async () => 1627172051;
adapters.volume.ethereum.start = async () => 1629764051;
export default adapters;
