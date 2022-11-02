import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

const adapters = univ2Adapter({
  [CHAIN.BSC]: "https://bnb.apeswapgraphs.com/subgraphs/name/ape-swap/apeswap-subgraph",
  [CHAIN.POLYGON]: "https://api.thegraph.com/subgraphs/name/prof-sd/as-matic-graft",
  [CHAIN.ETHEREUM]: "https://api.thegraph.com/subgraphs/name/apeswapfinance/ethereum-dex",
  [CHAIN.TELOS]: "https://telos.apeswapgraphs.com/subgraphs/name/ape-swap/apeswap-subgraph-telos"
}, {});
adapters.volume.bsc.start = async () => 1613273226;
adapters.volume.polygon.start = async () => 1623814026;
adapters.volume.ethereum.start = async () => 1652239626;
adapters.volume.telos.start = async () => 1665880589;

export default adapters;
