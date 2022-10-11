import fetchURL from "../../utils/fetchURL"
import { Chain } from "@defillama/sdk/build/general";
import { SimpleVolumeAdapter } from "../../dexVolume.type";
import { CHAIN } from "../../helper/chains";
import customBackfill from "../../helper/customBackfill";
import { getUniqStartOfTodayTimestamp } from "../../helper/getUniSubgraphVolume";


const historicalVolumeEndpoint = "https://api.synthetify.io/stats/mainnet"

interface IVolumeall {
  volume: number;
  timestamp: number;
}

const fetch = async (timestamp: number) => {
  const dayTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp * 1000))
  const historicalVolume: IVolumeall[] = (await fetchURL(historicalVolumeEndpoint))?.data;
  const totalVolume = historicalVolume
    .filter(volItem => volItem.timestamp <= dayTimestamp)
    .reduce((acc, { volume }) => acc + Number(volume), 0)

  const dailyVolume = historicalVolume
    .find(dayItem => dayItem.timestamp === dayTimestamp)?.volume

  return {
    totalVolume: `${totalVolume}`,
    dailyVolume: dailyVolume ? `${dailyVolume}` : undefined,
    timestamp: dayTimestamp,
  };
};

const getStartTimestamp = async () => {
  const historicalVolume: IVolumeall[] = (await fetchURL(historicalVolumeEndpoint))?.data;
  return (new Date(historicalVolume[0].timestamp).getTime())
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
