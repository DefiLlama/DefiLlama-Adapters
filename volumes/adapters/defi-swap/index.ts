import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

const adapter = univ2Adapter({
    [CHAIN.ETHEREUM]: "https://api.thegraph.com/subgraphs/name/crypto-com/swap-subgraph"
}, {
    factoriesName: "factories",
    dayData: "dayData",
    dailyVolume: "dailyVolumeUSD",
    totalVolume: "totalVolumeUSD",
});
adapter.volume.ethereum.start = async () => 1632268798;

export default adapter;
