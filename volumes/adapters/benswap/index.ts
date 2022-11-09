import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

const adapters = univ2Adapter({
  [CHAIN.SMARTBCH]: "https://subgraphs.benswap.cash/subgraphs/name/bentokenfinance/bch-exchange"
}, {
  factoriesName: "benSwapFactories",
  dayData: "benSwapDayData",
});

adapters.volume.smartbch.start = async () => 1632326400;
export default adapters;
