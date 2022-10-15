import fetchURL from "../../utils/fetchURL"
import { Chain } from "@defillama/sdk/build/general";
import { SimpleVolumeAdapter } from "../../dexVolume.type";
import { CHAIN } from "../../helper/chains";
import customBackfill from "../../helper/customBackfill";
import { getUniqStartOfTodayTimestamp } from "../../helper/getUniSubgraphVolume";


const historicalVolumeEndpoint = (chain: string) => `https://analytics.bog-general-api.com/daily_volume?type=all&chain=${chain}`

interface IVolumeall {
  dailyVolume: number;
  timestamp: number;
}
type TChains = {
  [k: Chain | string]: string;
};

const chains: TChains =  {
  [CHAIN.BSC]: 'bsc',
  [CHAIN.AVAX]: 'avax',
  [CHAIN.FANTOM]: 'ftm',
  [CHAIN.POLYGON]: 'matic',
  [CHAIN.CRONOS]: 'cro'
};

const fetch = (chain: Chain) => {
  return async (timestamp: number) => {
    const dayTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp * 1000))
    const historicalVolume: IVolumeall[] = (await fetchURL(historicalVolumeEndpoint(chains[chain])))?.data;
    const totalVolume = historicalVolume
      .filter(volItem => (new Date(volItem.timestamp).getTime() / 1000) <= dayTimestamp)
      .reduce((acc, { dailyVolume }) => acc + Number(dailyVolume), 0)

    const dailyVolume = historicalVolume
      .find(dayItem => (new Date(dayItem.timestamp).getTime() / 1000) === dayTimestamp)?.dailyVolume

    return {
      totalVolume: `${totalVolume}`,
      dailyVolume: dailyVolume ? `${dailyVolume}` : undefined,
      timestamp: dayTimestamp,
    };
  }
};

const getStartTimestamp = async (chain: string) => {
  const historical: IVolumeall[] = (await fetchURL(historicalVolumeEndpoint(chains[chain])))?.data;
  return (new Date(historical[0].timestamp).getTime() / 1000);
}

const adapter: SimpleVolumeAdapter = {
  volume: Object.keys(chains).reduce((acc, chain: any) => {
    return {
      ...acc,
      [chain]: {
        fetch: fetch(chain as Chain),
        start: () => getStartTimestamp(chain),
        customBackfill: customBackfill(chain as Chain, fetch)
      }
    }
  }, {} as SimpleVolumeAdapter['volume'])
};

export default adapter;
