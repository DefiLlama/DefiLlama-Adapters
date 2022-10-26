import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

const endpoints = {
  [CHAIN.FANTOM]: "https://api.thegraph.com/subgraphs/name/spartacus-finance/spadexinfo",
};
const adapter = univ2Adapter(endpoints, {});
adapter.volume.fantom.start = async () => 1650883041;

export default adapter
