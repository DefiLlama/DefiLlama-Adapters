
import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

const adapters = univ2Adapter({
  [CHAIN.POLYGON]: "https://api.thegraph.com/subgraphs/name/darth-crypto/gravis-finance",
  [CHAIN.BSC]: "https://api.thegraph.com/subgraphs/name/vkolerts/bsc-main"
}, {
});

adapters.volume.polygon.start = async () => 1622766258;
adapters.volume.bsc.start = async () => 1620174258;
export default adapters;
