import fetchURL from "../../utils/fetchURL"
import { Chain } from "@defillama/sdk/build/general";
import { SimpleVolumeAdapter } from "../../dexVolume.type";
import { CHAIN } from "../../helper/chains";
import customBackfill from "../../helper/customBackfill";
import { getUniqStartOfTodayTimestamp } from "../../helper/getUniSubgraphVolume";

const historicalVolumeEndpoint = "https://amm-api.stellarx.com/api/pools/30d-statistic/"

interface IVolumeall {
  volume: number;
  time: number;
}

const fetch = async (timestamp: number) => {
  const dayTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp * 1000))
  const historicalVolume: IVolumeall[] = (await fetchURL(historicalVolumeEndpoint))?.data;
  const totalVolume = historicalVolume
    .filter(volItem => (new Date(Number(`${volItem.time}`.split('.')[0]) * 1000).getTime() / 1000) <= dayTimestamp)
    .reduce((acc, { volume }) => acc + Number(volume), 0)

  const dailyVolume = historicalVolume
    .find(dayItem => (new Date(Number(`${dayItem.time}`.split('.')[0]) * 1000).getTime() / 1000) === dayTimestamp)?.volume

  return {
    totalVolume: `${totalVolume}`,
    dailyVolume: dailyVolume ? `${dailyVolume}` : undefined,
    timestamp: dayTimestamp,
  };
};

const getStartTimestamp = async () => {
  const historicalVolume: IVolumeall[] = (await fetchURL(historicalVolumeEndpoint))?.data;
  return (new Date(Number(`${historicalVolume[0].time}`.split('.')[0]) * 1000).getTime() / 1000)
}

const adapter: SimpleVolumeAdapter = {
  volume: {
    [CHAIN.STELLAR]: {
      fetch,
      start: getStartTimestamp,
      customBackfill: customBackfill(CHAIN.STELLAR as Chain, (_chian: string) => fetch)
    },
  },
};

export default adapter;
