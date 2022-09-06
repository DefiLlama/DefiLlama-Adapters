import { SimpleVolumeAdapter } from "../../dexVolume.type";
import { getUniqStartOfTodayTimestamp } from "../../helper/getUniSubgraphVolume";

const { fetchURL } = require("../../helper/utils");

interface IKlaySwapInfoDayVolumeItem {
  dateId: string
  amount: string
}

const historicalVolumeEndpoint =
  "https://s.klayswap.com/stat/klayswapInfo.json";

const fetch = async (timestamp: number) => {
  const dayTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp * 1000))
  const historicalVolume: IKlaySwapInfoDayVolumeItem[] = (await fetchURL(historicalVolumeEndpoint))?.data
    .dayVolume;

  return {
    timestamp: dayTimestamp,
    dailyVolume: historicalVolume.find(dayItem => (new Date(dayItem.dateId).getTime() / 1000) === dayTimestamp)?.amount,
  };
};

const getStartTimestamp = async () => {
  const historicalVolume: IKlaySwapInfoDayVolumeItem[] = (await fetchURL(historicalVolumeEndpoint))?.data
    .dayVolume;

  return (new Date(historicalVolume[0].dateId).getTime()) / 1000
}

const adapter: SimpleVolumeAdapter = {
  volume: {
    klaytn: {
      fetch,
      runAtCurrTime: true,
      start: getStartTimestamp,
    },
    // TODO custom backfill
  },
};

export default adapter;
