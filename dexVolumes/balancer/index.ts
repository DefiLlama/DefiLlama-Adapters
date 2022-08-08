import { DexVolumeAdapter, Fetch } from "../dexVolume.type";
import { getChainVolume } from "../helper/getUniSubgraphVolume";
import { ARBITRUM, ETHEREUM, POLYGON } from "../helper/chains";
import { Chain } from "@defillama/sdk/build/general";
import { getChainBlocks } from "@defillama/sdk/build/computeTVL/blocks";
import { getBlock } from "../../projects/helper/getBlock"

const endpoints = {
  [ETHEREUM]: "https://api.thegraph.com/subgraphs/name/balancer-labs/balancer",
  [POLYGON]:
    "https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-polygon-v2",
  [ARBITRUM]:
    "https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-arbitrum-v2",
};

const graphs = getChainVolume({
  graphUrls: {
    [ETHEREUM]: endpoints[ETHEREUM],
    [POLYGON]: endpoints[POLYGON],
    [ARBITRUM]: endpoints[ARBITRUM],
  },
  totalVolume: {
    factory: "balancers",
    field: "totalSwapVolume",
  },
  hasDailyVolume: false,
});

const customBackfill = (chain: Chain): Fetch => async (timestamp: number, chainBlocks: ChainBlocks) => {
  const fetchGetVolume = graphs(chain)
  const resultDayN = await fetchGetVolume(timestamp, chainBlocks)
  const timestampPreviousDay = timestamp - 60 * 60 * 24
  const chainBlocksPreviousDay = (await getBlock(timestampPreviousDay, chain, {})) - 20
  const resultPreviousDayN = await fetchGetVolume(timestampPreviousDay, { [chain]: chainBlocksPreviousDay })
  return {
    block: resultDayN.block,
    timestamp: resultDayN.timestamp,
    totalVolume: resultDayN.totalVolume,
    dailyVolume: `${Number(resultDayN.totalVolume) - Number(resultPreviousDayN.totalVolume)}`,
  }
}

const adapter: DexVolumeAdapter = {
  volume: {
    [ETHEREUM]: {
      fetch: graphs(ETHEREUM),
      start: 0,
      customBackfill: customBackfill(ETHEREUM),
    },
    // POLYGON
    [POLYGON]: {
      fetch: graphs(POLYGON),
      start: 0,
      customBackfill: customBackfill(POLYGON),
    },
    // ARBITRUM
    [ARBITRUM]: {
      fetch: graphs(ARBITRUM),
      start: 0,
      customBackfill: customBackfill(ARBITRUM),
    },
  },
};

export default adapter;

// TODO custom backfill have to get specific block at start of each day
