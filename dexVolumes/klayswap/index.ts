import { DexVolumeAdapter } from "../dexVolume.type";

const { fetchURL } = require("../helper/utils");

interface IKlaySwapInfoDayVolumeItem {
  dateId: string
  amount: string
}

const historicalVolumeEndpoint =
  "https://s.klayswap.com/stat/klayswapInfo.json";

const fetch = async (timestamp: number) => {
  const historicalVolume: IKlaySwapInfoDayVolumeItem[] = (await fetchURL(historicalVolumeEndpoint))?.data
    .dayVolume;

  return {
    timestamp,
    dailyVolume: historicalVolume.find(dayItem => (new Date(dayItem.dateId).getTime() / 1000) === timestamp)?.amount,
  };
};

const getStartTimestamp = async () => {
  const historicalVolume: IKlaySwapInfoDayVolumeItem[] = (await fetchURL(historicalVolumeEndpoint))?.data
    .dayVolume;

  return (new Date(historicalVolume[0].dateId).getTime()) / 1000
}

const adapter: DexVolumeAdapter = {
  volume: {
    klatyn: {
      fetch,
      runAtCurrTime: true,
      customBackfill: fetch,
      start: getStartTimestamp,
    },
    // TODO custom backfill
  },
};

export default adapter;
