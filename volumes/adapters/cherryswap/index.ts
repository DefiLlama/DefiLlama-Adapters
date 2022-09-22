import { univ2Adapter } from "../../helper/chains";
import { CHAIN } from "../../helper/getUniSubgraphVolume";

const adapter = univ2Adapter({
  [CHAIN.OKEXCHAIN]: "https://okinfo.cherryswap.net/subgraphs/name/cherryswap/cherrysubgraph"
}, {
  factoriesName: "uniswapFactories",
  dayData: "uniswapDayData",
  hasTotalVolume: false
});

adapter.volume.okexchain.start = async () => 1627385129;
export default adapter;
