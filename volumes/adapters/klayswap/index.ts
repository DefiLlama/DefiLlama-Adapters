import { SimpleVolumeAdapter } from "../../dexVolume.type";
import { Chain } from "@defillama/sdk/build/general";
import { CHAIN } from "../../helper/chains";
import customBackfill from "../../helper/customBackfill";
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
  const totalVolume = historicalVolume
    .filter(volItem => (new Date(volItem.dateId).getTime() / 1000) <= dayTimestamp)
    .reduce((acc, { amount }) => acc + Number(amount), 0)

  return {
    totalVolume: `${totalVolume}`,
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
    [CHAIN.KLAYTN]: {
      fetch,
      runAtCurrTime: true,
      start: getStartTimestamp,
      customBackfill: customBackfill(CHAIN.KLAYTN as Chain, (_chian: string) => fetch)
    },
  },
};

export default adapter;
