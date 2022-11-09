import fetchURL from "../../utils/fetchURL"
import { Chain } from "@defillama/sdk/build/general";
import { SimpleVolumeAdapter } from "../../dexVolume.type";
import { CHAIN } from "../../helper/chains";
import customBackfill from "../../helper/customBackfill";
import { getUniqStartOfTodayTimestamp } from "../../helper/getUniSubgraphVolume";

const historicalVolumeEndpoint = "https://api-junoswap.enigma-validator.com/volumes/total/historical/999M/d"

interface IVolumeall {
  volume_total: string;
  date: string;
}

const fetch = async (timestamp: number) => {
  const dayTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp * 1000))
  const historicalVolume: IVolumeall[] = (await fetchURL(historicalVolumeEndpoint))?.data;
  const totalVolume = historicalVolume
    .filter(volItem => (new Date(volItem.date).getTime() / 1000) <= dayTimestamp)
    .reduce((acc, { volume_total }) => acc + Number(volume_total), 0)

  const dailyVolume = historicalVolume
    .find(dayItem => (new Date(dayItem.date).getTime() / 1000) === dayTimestamp)?.volume_total

  return {
    totalVolume: `${totalVolume}`,
    dailyVolume: dailyVolume ? `${dailyVolume}` : undefined,
    timestamp: dayTimestamp,
  };
};

const getStartTimestamp = async () => {
  const historicalVolume: IVolumeall[] = (await fetchURL(historicalVolumeEndpoint))?.data;
  return (new Date(historicalVolume[0].date).getTime()) / 1000
}

const adapter: SimpleVolumeAdapter = {
  volume: {
    [CHAIN.JUNO]: {
      fetch,
      start: getStartTimestamp,
      customBackfill: customBackfill(CHAIN.JUNO as Chain, (_chian: string) => fetch)
    },
  },
};

export default adapter;
