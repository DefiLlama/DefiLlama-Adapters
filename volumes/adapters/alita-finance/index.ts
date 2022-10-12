import { univ2Adapter } from "../../helper/getUniSubgraphVolume";
import { CHAIN } from "../../helper/chains";

const adapter = univ2Adapter({
  [CHAIN.BSC]: "https://api.thegraph.com/subgraphs/name/alita-finance/exchangev2"
}, {});

adapter.volume.bsc.start = async () => 1629947542;
export default adapter;
