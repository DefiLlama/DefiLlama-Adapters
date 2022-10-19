import fetchURL from "../../utils/fetchURL"
import { Chain } from "@defillama/sdk/build/general";
import { SimpleVolumeAdapter } from "../../dexVolume.type";
import { CHAIN } from "../../helper/chains";
import customBackfill from "../../helper/customBackfill";
import { getUniqStartOfTodayTimestamp } from "../../helper/getUniSubgraphVolume";

const historicalVolumeEndpoint = "https://stats.mux.network/api/public/dashboard/e1134798-4660-489f-a45a-45d9adb05918/dashcard/14/card/15?parameters=[]"

interface IVolumeall {
  volume: string;
  time: string;
  title: string;
}

type chains = {
  [chain: string | Chain]: string;
}

const chainsMap: chains = {
  [CHAIN.ARBITRUM]: "Trading - Arbitrum",
  [CHAIN.AVAX]: "Trading - Avalanche",
  [CHAIN.BSC]: "Trading - BSC",
  [CHAIN.FANTOM]: "Trading - Fantom"
}

const fetch = (chain: Chain) => {
  return async (timestamp: number) => {
    const dayTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp * 1000))
    const callhistoricalVolume = (await fetchURL(historicalVolumeEndpoint))?.data.data.rows;

    const historicalVolume: IVolumeall[] = callhistoricalVolume.map((e: string[] | number[]) => {
      const [time, title, volume] = e;
      return {
        time,
        volume,
        title
      } as IVolumeall;
    });

    const historical = historicalVolume.filter((e: IVolumeall)  => e.title === chainsMap[chain]);
    const totalVolume = historical
      .filter(volItem => getUniqStartOfTodayTimestamp(new Date(volItem.time)) <= dayTimestamp)
      .reduce((acc, { volume }) => acc + Number(volume), 0)

    const dailyVolume = historical
      .find(dayItem => getUniqStartOfTodayTimestamp(new Date(dayItem.time)) === dayTimestamp)?.volume

    return {
      totalVolume: `${totalVolume}`,
      dailyVolume: dailyVolume ? `${dailyVolume}` : undefined,
      timestamp: dayTimestamp,
    };
  }
};

const getStartTimestamp = async (chain: Chain) => {
  const callhistoricalVolume = (await fetchURL(historicalVolumeEndpoint))?.data.data.rows;
  const historicalVolume: IVolumeall[] = callhistoricalVolume.map((e: string[] | number[]) => {
    const [time, title, volume] = e;
    return {
      time,
      volume,
      title
    } as IVolumeall;
  });

  const historicalCall = historicalVolume.filter((e: IVolumeall)  => e.title === chainsMap[chain]);
  const historical = historicalCall.sort((a: IVolumeall,b: IVolumeall)=> new Date(a.time).getTime() - new Date(b.time).getTime());
  return (new Date(historical[0].time).getTime()) / 1000
}

const adapter: SimpleVolumeAdapter = {
  volume: Object.keys(chainsMap).reduce((acc, chain: any) => {
    return {
      ...acc,
      [chain]: {
        fetch: fetch(chain as Chain),
        start: async () => getStartTimestamp(chain),
        customBackfill: customBackfill(chain as Chain, fetch),
      }
    }
  }, {} as SimpleVolumeAdapter['volume'])
};

export default adapter;
