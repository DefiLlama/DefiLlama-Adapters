import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";
const adapter = univ2Adapter({
    [CHAIN.ETHEREUM]: "https://api.thegraph.com/subgraphs/name/dfx-finance/dfx-v1",
    [CHAIN.POLYGON]: "https://api.thegraph.com/subgraphs/name/dfx-finance/dfx-v1-polygon",
}, {
    factoriesName: "dfxfactories",
    totalVolume: "totalVolumeUSD",
    dayData: "dfxdayData",
    dailyVolume: "dailyVolumeUSD"
});
adapter.volume.ethereum.start = async () => 1621418717;
adapter.volume.polygon.start = async () => 1626861917;
export default adapter;
