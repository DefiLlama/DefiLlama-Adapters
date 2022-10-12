import fetchURL from "../../utils/fetchURL"
import { Chain } from "@defillama/sdk/build/general";
import { FetchResult, SimpleVolumeAdapter, ChainBlocks } from "../../dexVolume.type";
import { CHAIN } from "../../helper/chains";
import customBackfill, { IGraphs } from "../../helper/customBackfill";
import { getUniqStartOfTodayTimestamp } from "../../helper/getUniSubgraphVolume";

const poolsDataEndpoint = (chain: string) => `https://data.unifi.report/api/total-volume-liquidity/?blockchain=${chain}&page_size=1000`;

type TChains = {
  [chain: string | Chain]: string;
}
const chains: TChains = {
  [CHAIN.AVAX]: "Avalanche",
  [CHAIN.BITTORRENT]: "BitTorrent",
  [CHAIN.TRON]: "Tron",
  [CHAIN.ONTOLOGY_EVM]: "Ontology",
  [CHAIN.HARMONY]: "Harmony",
  [CHAIN.BSC]: "Binance",
  [CHAIN.ETHEREUM]: "Ethereum",
  [CHAIN.ICON]: "Icon",
  [CHAIN.IOTEX]: "IoTeX",
  [CHAIN.POLYGON]: "Polygon",
  // [CHAIN.FANTOM]: "Fantom"
};

interface IVolumeall {
  chain: string;
  volume: string;
  datetime: string;
}

const graphs = (chain: Chain) => {
  return async (timestamp: number, _chainBlocks: ChainBlocks): Promise<FetchResult> => {
    const dayTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp * 1000))
    const historicalVolume: IVolumeall[] = (await fetchURL(poolsDataEndpoint(chains[chain])))?.data.results;

    const totalVolume = historicalVolume
      .filter(volItem => (new Date(volItem.datetime).getTime() / 1000) <= dayTimestamp)
      .reduce((acc, { volume }) => acc + Number(volume), 0)
    const dailyVolume = historicalVolume
      .find(dayItem => (new Date(dayItem.datetime).getTime() / 1000) === dayTimestamp)?.volume

    return {
      totalVolume: `${totalVolume}`,
      dailyVolume: dailyVolume ? `${dailyVolume}` : undefined,
      timestamp: dayTimestamp,
    };
  }
};

const getStartTimestamp = async (chain: Chain) => {
  const historicalVolume: IVolumeall[] = (await fetchURL(poolsDataEndpoint(chains[chain])))?.data.results;
  return (new Date(historicalVolume[historicalVolume.length - 1].datetime).getTime()) / 1000
}

const adapter: SimpleVolumeAdapter = {
  volume: Object.keys(chains).reduce((acc, chain: any) => {
    return {
      ...acc,
      [chain]: {
        fetch: graphs(chain as Chain),
        start: async () => getStartTimestamp(chain),
        customBackfill: customBackfill(chain as Chain, graphs as unknown as IGraphs),
      }
    }
  }, {} as SimpleVolumeAdapter['volume'])
};

export default adapter;
