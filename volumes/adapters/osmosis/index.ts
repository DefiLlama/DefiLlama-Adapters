import { SimpleVolumeAdapter } from "../../dexVolume.type";
import { getUniqStartOfTodayTimestamp } from "../../helper/getUniSubgraphVolume";
import fetchURL from "../../utils/fetchURL"

const historicalVolumeEndpoint = "https://api-osmosis.imperator.co/volume/v2/historical/chart"

interface IChartItem {
  time: string
  value: number
}

const fetch = async (timestamp: number) => {
  const dayTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp * 1000))
  const historicalVolume: IChartItem[] = (await fetchURL(historicalVolumeEndpoint))?.data;

  const totalVolume = historicalVolume
    .filter(volItem => (new Date(volItem.time).getTime() / 1000) <= dayTimestamp)
    .reduce((acc, { value }) => acc + value, 0)

  const dailyVolume = historicalVolume
    .find(dayItem => (new Date(dayItem.time).getTime() / 1000) === dayTimestamp)?.value

  return {
    totalVolume: `${totalVolume}`,
    dailyVolume: dailyVolume ? `${dailyVolume}` : undefined,
    timestamp: dayTimestamp,
  };
};

const getStartTimestamp = async () => {
  const historicalVolume: IChartItem[] = (await fetchURL(historicalVolumeEndpoint))?.data
  return (new Date(historicalVolume[0].time).getTime()) / 1000
}

const adapter: SimpleVolumeAdapter = {
  volume: {
    cosmos: {
      fetch,
      runAtCurrTime: true,
      start: getStartTimestamp,
    },
  },
};

export default adapter;
