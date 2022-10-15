import { Chain } from "@defillama/sdk/build/general";
import { SimpleVolumeAdapter } from "../../dexVolume.type";
import { CHAIN } from "../../helper/chains";
import customBackfill from "../../helper/customBackfill";
import { getUniqStartOfTodayTimestamp } from "../../helper/getUniSubgraphVolume";
import axios from "axios";

const historicalVolumeEndpoint = "https://api.dexalot.com/api/stats/dailyvolumes"

interface IVolumeall {
  volumeusd: string;
  date: number;
}

const fetch = async (timestamp: number) => {
  const dayTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp * 1000))
  const historicalVolume: IVolumeall[] = (await axios.get(historicalVolumeEndpoint, { headers: {
    'origin': 'https://app.dexalot.com'
  }}))?.data;
  const totalVolume = historicalVolume
    .filter(volItem => (new Date(volItem.date).getTime() / 1000) <= dayTimestamp)
    .reduce((acc, { volumeusd }) => acc + Number(volumeusd), 0)

  const dailyVolume = historicalVolume
    .find(dayItem => (new Date(dayItem.date).getTime() / 1000) === dayTimestamp)?.volumeusd

  return {
    totalVolume: `${totalVolume}`,
    dailyVolume: dailyVolume ? `${dailyVolume}` : undefined,
    timestamp: dayTimestamp,
  };
};

const getStartTimestamp = async () => {
  const historicalVolume: IVolumeall[] = (await axios.get(historicalVolumeEndpoint, { headers: {
    'origin': 'https://app.dexalot.com'
  }}))?.data;
  return (new Date(historicalVolume[0].date).getTime()) / 1000
}

const adapter: SimpleVolumeAdapter = {
  volume: {
    [CHAIN.AVAX]: {
      fetch,
      start: getStartTimestamp,
      customBackfill: customBackfill(CHAIN.AVAX as Chain, (_chian: string) => fetch)
    },
  },
};

export default adapter;
