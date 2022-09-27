import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

const endpoints = {
  [CHAIN.BSC]: "https://api.thegraph.com/subgraphs/name/cone-exchange/cone",
};
const adapter = univ2Adapter(endpoints, {});
adapter.volume.bsc.start = async () => 1626677527;

export default adapter
