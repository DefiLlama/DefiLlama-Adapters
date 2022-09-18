const { fetchURL } = require("../../helper/utils");
import { SimpleVolumeAdapter } from "../../dexVolume.type";
import { getUniqStartOfTodayTimestamp } from "../../helper/getUniSubgraphVolume";

const historicalVolumeEndpoint = "https://abc.endjgfsv.link/swap/scan/volumeall"

interface IVolumeall {
  volume: string;
  tokenPrice: string;
  time: number;
}

const fetch = async (timestamp: number) => {
  const dayTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp * 1000))
  const historicalVolume: IVolumeall[] = (await fetchURL(historicalVolumeEndpoint))?.data.data;
  const totalVolume = historicalVolume
    .filter(volItem => (new Date(volItem.time).getTime() / 1000) <= dayTimestamp)
    .reduce((acc, { volume }) => acc + Number(volume), 0)

  const dailyVolume = historicalVolume
    .find(dayItem => (new Date(dayItem.time).getTime() / 1000) === dayTimestamp)?.volume

  return {
    totalVolume: `${totalVolume}`,
    dailyVolume: dailyVolume ? `${dailyVolume}` : undefined,
    timestamp: dayTimestamp,
  };
};

const getStartTimestamp = async () => {
  const historicalVolume: IVolumeall[] = (await fetchURL(historicalVolumeEndpoint))?.data.data;
  return (new Date(historicalVolume[0].time).getTime()) / 1000
}

const adapter: SimpleVolumeAdapter = {
  volume: {
    tron: {
      fetch,
      runAtCurrTime: true,
      start: getStartTimestamp,
    },
  },
};

export default adapter;
