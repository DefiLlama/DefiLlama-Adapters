import fetchURL from "../../utils/fetchURL"
import { Chain } from "@defillama/sdk/build/general";
import { SimpleVolumeAdapter } from "../../dexVolume.type";
import { CHAIN } from "../../helper/chains";
import customBackfill from "../../helper/customBackfill";
import { getUniqStartOfTodayTimestamp } from "../../helper/getUniSubgraphVolume";

const historicalVolumeEndpoint = "https://api.crema.finance/v1/histogram?date_type=day&typ=vol&limit=1000"

interface IVolumeall {
  num: string;
  date: string;
}

const fetch = async (timestamp: number) => {
  const dayTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp * 1000))
  const historicalVolume: IVolumeall[] = (await fetchURL(historicalVolumeEndpoint))?.data.data.list;
  const totalVolume = historicalVolume
    .filter(volItem => (new Date(volItem.date.split('T')[0]).getTime() / 1000) <= dayTimestamp)
    .reduce((acc, { num }) => acc + Number(num), 0)

  const dailyVolume = historicalVolume
    .find(dayItem => (new Date(dayItem.date.split('T')[0]).getTime() / 1000) === dayTimestamp)?.num

  return {
    totalVolume: `${totalVolume}`,
    dailyVolume: dailyVolume ? `${dailyVolume}` : undefined,
    timestamp: dayTimestamp,
  };
};

const getStartTimestamp = async () => {
  const historicalVolume: IVolumeall[] = (await fetchURL(historicalVolumeEndpoint))?.data.data.list;
  return (new Date(historicalVolume[0].date.split('T')[0]).getTime()) / 1000
}

const adapter: SimpleVolumeAdapter = {
  volume: {
    [CHAIN.SOLANA]: {
      fetch,
      start: getStartTimestamp,
      customBackfill: customBackfill(CHAIN.SOLANA as Chain, (_chian: string) => fetch)
    },
  },
};

export default adapter;
