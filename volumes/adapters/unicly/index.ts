import axios from "axios";
import { Chain } from "@defillama/sdk/build/general";
import { SimpleVolumeAdapter } from "../../dexVolume.type";
import { CHAIN } from "../../helper/chains";
import customBackfill from "../../helper/customBackfill";
import { getUniqStartOfTodayTimestamp } from "../../helper/getUniSubgraphVolume";

const historicalVolumeEndpoint = "https://api.viewblock.io/dex/unicly"

interface IVolumeall {
  value: number;
  timestamp: number;
}
const headers = {
  "Origin": "https://dex.viewblock.io"
}
const fetch = async (timestamp: number) => {
  const dayTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp * 1000))
  const historicalVolume: IVolumeall[] = (await axios.get(historicalVolumeEndpoint, { headers }))?.data.charts.volume;
  const totalVolume = historicalVolume
    .filter(volItem => (new Date(volItem.timestamp).getTime() / 1000) <= dayTimestamp)
    .reduce((acc, { value }) => acc + Number(value), 0)

  const dailyVolume = historicalVolume
    .find(dayItem => (new Date(dayItem.timestamp).getTime() / 1000) === dayTimestamp)?.value

  return {
    totalVolume: `${totalVolume}`,
    dailyVolume: dailyVolume ? `${dailyVolume}` : undefined,
    timestamp: dayTimestamp,
  };
};

const getStartTimestamp = async () => {
  const historicalVolume: IVolumeall[] = (await axios.get(historicalVolumeEndpoint, { headers }))?.data.charts.volume;
  return (new Date(historicalVolume[0].timestamp).getTime()) / 1000
}

const adapter: SimpleVolumeAdapter = {
  volume: {
    [CHAIN.ETHEREUM]: {
      fetch,
      start: getStartTimestamp,
      customBackfill: customBackfill(CHAIN.ETHEREUM as Chain, (_chian: string) => fetch)
    },
  },
};

export default adapter;
