import fetchURL from "../../utils/fetchURL"
import { Chain } from "@defillama/sdk/build/general";
import { SimpleVolumeAdapter } from "../../dexVolume.type";
import { CHAIN } from "../../helper/chains";
import customBackfill from "../../helper/customBackfill";
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
    [CHAIN.TRON]: {
      fetch,
      start: getStartTimestamp,
      customBackfill: customBackfill(CHAIN.TRON as Chain, (_chian: string) => fetch)
    },
  },
};

export default adapter;
