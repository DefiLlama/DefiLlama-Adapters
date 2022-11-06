import { BreakdownVolumeAdapter, Fetch, SimpleVolumeAdapter } from "../../dexVolume.type";
import { CHAIN } from "../../helper/chains";
import axios from 'axios';

const chains = [
  CHAIN.ETHEREUM, 
  CHAIN.ARBITRUM, 
  CHAIN.AVAX, 
  CHAIN.BSC,
  CHAIN.FANTOM,
  CHAIN.OPTIMISM,
  CHAIN.POLYGON
];

interface IVolumeResponse {
  timestamp?: number;
  dailyVolume: string;
  earliestTimestamp: number;
  totalVolume: string;
}

const urlTemplate = "http://<NETWORK>.<CHAIN>.api.dexible.io/v1/stats/volume?";

const buildPath = (network: string, chain: string = "mainnet"): string => {
  return urlTemplate.replace("<NETWORK>", network)
    .replace("<CHAIN>", chain);
}

const chainPath = (chain: string): string => {
  switch(chain) {
    case CHAIN.ARBITRUM: {
      return buildPath("arbitrum");
    }
    case CHAIN.AVAX: {
      return buildPath("avalanche");
    }
    case CHAIN.BSC: {
      return buildPath("bsc")
    }
    case CHAIN.ETHEREUM: {
      return buildPath("ethereum");
    }
    case CHAIN.FANTOM: {
      return buildPath("fantom", "opera");
    }
    case CHAIN.OPTIMISM: {
      return buildPath("optimism");
    }
    case CHAIN.POLYGON: {
      return buildPath("polygon");
    }
    default:
      throw new Error(`${chain} is not a compatible chain`)
  }
}

let cachedResponse: IVolumeResponse | null = null;

const getAndCache = async (chain: string, timestamp: number): Promise<{
  timestamp: number;
  dailyVolume: string;
  totalVolume: string;
}> => {
  cachedResponse = null;
  const url = `${chainPath(chain)}${timestamp}`;
  const r = await axios.get(url);
  if(!r.data) {
    throw new Error("No data found in response");
  }
  const data = r.data as IVolumeResponse;
  cachedResponse = data;
  cachedResponse.timestamp = data.timestamp || timestamp;
  cachedResponse.earliestTimestamp = data.earliestTimestamp || 0;
  return {
    timestamp: cachedResponse.timestamp,
    dailyVolume: cachedResponse.dailyVolume,
    totalVolume: data.totalVolume
  };
}

const getFetch = (chain: string): Fetch => async (timestamp: number) => {
  if(cachedResponse) {
    return Promise.resolve({
      timestamp: cachedResponse.earliestTimestamp,
      dailyVolume: cachedResponse.dailyVolume,
      totalVolume: cachedResponse.totalVolume
    });
  }
  return await getAndCache(chain, timestamp);
}

const adapter: BreakdownVolumeAdapter = {
  breakdown: {
    "Dexible_v2": {
      ...chains.reduce((acc, chain) => {
        return {
          ...acc,
          [chain]: {
            fetch: getFetch(chain),
            start: async () => {
              await getAndCache(chain, Math.ceil(Date.now()/1000));
              if(cachedResponse) {
                return cachedResponse.earliestTimestamp;
              }
              return 0;
            }
          }
        }
      }, {}) as SimpleVolumeAdapter['volume']
    }
  }
}

export default adapter;
