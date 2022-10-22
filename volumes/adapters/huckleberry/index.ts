import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

export default univ2Adapter({
  [CHAIN.MOONRIVER]: "https://api.thegraph.com/subgraphs/name/huckleberrydex/huckleberry-subgraph",
  [CHAIN.CLV]: "https://clover-graph-node.huckleberry.finance/subgraphs/name/huckleberry/clv-parachain-subgraph"
}, {});
