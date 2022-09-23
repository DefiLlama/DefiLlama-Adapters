import { Adapter, BreakdownVolumeAdapter } from "../../dexVolume.type";
import { getStartTimestamp } from "../../helper/getStartTimestamp";
import {
  getChainVolume,
  DEFAULT_TOTAL_VOLUME_FIELD,
  DEFAULT_DAILY_VOLUME_FIELD,
} from "../../helper/getUniSubgraphVolume";

const normalizeChain = {
    "avax": "avalanche"
} as {[c:string]:string}

// velas, oasis & bittorrent missing
const elasticChains = ["ethereum", "polygon", "bsc", "avax", "fantom", "arbitrum", "optimism"]

const elasticEndpoints = elasticChains.reduce((acc, chain)=>({
    [chain]: `https://api.thegraph.com/subgraphs/name/kybernetwork/kyberswap-elastic-${normalizeChain[chain]??chain}`,
    ...acc,
}), {
    //cronos: "https://cronos-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-elastic-cronos", // missing -> almost no volume and stale
    ethereum: "https://api.thegraph.com/subgraphs/name/kybernetwork/kyberswap-elastic-mainnet",
    arbitrum: "https://api.thegraph.com/subgraphs/name/kybernetwork/kyberswap-elastic-arbitrum-one",
    polygon: "https://api.thegraph.com/subgraphs/name/kybernetwork/kyberswap-elastic-matic"
} as any);

const elasticGraphs = getChainVolume({
    graphUrls: elasticEndpoints,
    totalVolume: {
      factory: "factories",
      field: DEFAULT_TOTAL_VOLUME_FIELD,
    },
    dailyVolume: {
      factory: "kyberSwapDayData",
      field: "volumeUSD",
    },
});

const classicEndpoints = [...elasticChains, "aurora"].reduce((acc, chain)=>({
    [chain]: `https://api.thegraph.com/subgraphs/name/kybernetwork/kyberswap-exchange-${normalizeChain[chain]??chain}`,
    ...acc,
}), {
    cronos: "https://cronos-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-exchange-cronos",
    arbitrum: "https://arbitrum-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-exchange-arbitrum",
} as any);

const classicGraphs = getChainVolume({
  graphUrls: classicEndpoints,
  totalVolume: {
    factory: "dmmFactories",
    field: DEFAULT_TOTAL_VOLUME_FIELD,
  },
  dailyVolume: {
    factory: "dmmDayData",
    field: DEFAULT_DAILY_VOLUME_FIELD,
  },
});

function buildFromEndpoints(endpoints: typeof classicEndpoints, graphs: typeof classicGraphs, volumeField:string, dailyDataField:string){
    return Object.keys(endpoints).reduce((acc, chain) => {
        acc[chain] = {
          fetch: graphs(chain as any),
          start: getStartTimestamp({
            endpoints: endpoints,
            chain: chain,
            volumeField,
            dailyDataField
          })
        }
        return acc
      }, {} as Adapter)
}

const adapter: BreakdownVolumeAdapter = {
  breakdown: {
    classic: buildFromEndpoints(classicEndpoints, classicGraphs, DEFAULT_DAILY_VOLUME_FIELD, "dmmDayDatas"),
    elastic: buildFromEndpoints(elasticEndpoints, elasticGraphs, "volumeUSD", "kyberSwapDayDatas")
  }
}

export default adapter;
