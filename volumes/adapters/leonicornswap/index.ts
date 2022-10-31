import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

export default univ2Adapter({
  [CHAIN.BSC]: "https://api.thegraph.com/subgraphs/name/leonicornswap/exchange"
}, {
    factoriesName: "leonicornFactories",
    dayData: "leonicornDayData",
});
