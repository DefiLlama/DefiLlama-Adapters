const { fetchURL } = require("../../helper/utils");
import { Chain } from "@defillama/sdk/build/general";
import { FetchResult, SimpleVolumeAdapter, ChainBlocks } from "../../dexVolume.type";
import { CHAIN } from "../../helper/chains";
import customBackfill, { IGraphs } from "../../helper/customBackfill";
import { getUniqStartOfTodayTimestamp } from "../../helper/getUniSubgraphVolume";

type TEndoint = {
  [chain: string | Chain]: string;
};

const endpoints: TEndoint = {
  [CHAIN.BSC]: "http://public.tdex.cz/get_volumes_list?chain_id=56",
  [CHAIN.HECO]: "http://public.tdex.cz/get_volumes_list?chain_id=128",
};

interface IVolumeall {
  date: string;
  volume: number;
}

const graphs = (chain: Chain) => {
  return async (timestamp: number, _chainBlocks: ChainBlocks): Promise<FetchResult> => {
    const dayTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp * 1000))
    const historicalVolume: IVolumeall[] = (await fetchURL(endpoints[chain]))?.data.result;
    const totalVolume = historicalVolume
      .filter(volItem => (new Date(volItem.date).getTime() / 1000) <= dayTimestamp)
      .reduce((acc, { volume }) => acc + Number(volume), 0)
    const dailyVolume = historicalVolume
      .find(dayItem => (new Date(dayItem.date).getTime() / 1000) === dayTimestamp)?.volume

    return {
      totalVolume: `${totalVolume}`,
      dailyVolume: dailyVolume ? `${dailyVolume}` : undefined,
      timestamp: dayTimestamp,
    };
  }
};

const getStartTimestamp = async (chain: Chain) => {
  const historicalVolume: IVolumeall[] = (await fetchURL(endpoints[chain]))?.data.result;
  return (new Date(historicalVolume[0].date).getTime()) / 1000;
}

const adapter: SimpleVolumeAdapter = {
  volume: Object.keys(endpoints).reduce((acc, chain: any) => {
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
