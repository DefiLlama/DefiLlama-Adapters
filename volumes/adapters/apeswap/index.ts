import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

export default univ2Adapter({
    "bsc": "https://bnb.apeswapgraphs.com/subgraphs/name/ape-swap/apeswap-subgraph",
    //"polygon": "https://api.thegraph.com/subgraphs/name/apeswapfinance/dex-polygon", -> indexing error
    "ethereum": "https://api.thegraph.com/subgraphs/name/apeswapfinance/ethereum-dex",
}, {});
