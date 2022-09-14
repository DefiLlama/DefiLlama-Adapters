

import { univ2Adapter } from "../../helper/getUniSubgraphVolume";
import { CHAIN } from "../../helper/chains";
const endpoints = {
  [CHAIN.BSC]: "https://bnb.apeswapgraphs.com/subgraphs/name/ape-swap/apeswap-subgraph",
  // [CHAIN.POLYGON]: "https://api.thegraph.com/subgraphs/name/apeswapfinance/dex-polygon", // index error
};

export default univ2Adapter(endpoints, {
    factoriesName: "uniswapFactories",
    dayData: "uniswapDayData",
});
