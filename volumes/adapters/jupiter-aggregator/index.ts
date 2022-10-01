import fetchURL from "../../utils/fetchURL"
import { Chain } from "@defillama/sdk/build/general";
import { SimpleVolumeAdapter } from "../../dexVolume.type";
import { CHAIN } from "../../helper/chains";
import customBackfill from "../../helper/customBackfill";
import { getUniqStartOfTodayTimestamp } from "../../helper/getUniSubgraphVolume";


const historicalVolumeEndpoint = "https://cache.jup.ag/stats/day"

interface IVolumeall {
  groupTimestamp: string;
  amount: string;
}

const fetch = async (timestamp: number) => {
  const dayTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp * 1000))
  const historicalVolume: IVolumeall[] = (await fetchURL(historicalVolumeEndpoint))?.data.volumeInUSD;
  const totalVolume = historicalVolume
    .filter(volItem => (new Date(volItem.groupTimestamp).getTime() / 1000) <= dayTimestamp)
    .reduce((acc, { amount }) => acc + Number(amount), 0)

  const dailyVolume = historicalVolume
    .find(dayItem => (new Date(dayItem.groupTimestamp).getTime() / 1000) === dayTimestamp)?.amount

  return {
    totalVolume: `${totalVolume}`,
    dailyVolume: dailyVolume ? `${dailyVolume}` : undefined,
    timestamp: dayTimestamp,
  };
};

const getStartTimestamp = async () => {
  const historicalVolume: IVolumeall[] = (await fetchURL(historicalVolumeEndpoint))?.data.volumeInUSD;
  return (new Date(historicalVolume[historicalVolume.length - 1].groupTimestamp).getTime() / 1000);
}
const adapter: SimpleVolumeAdapter = {
  volume: {
    [CHAIN.SOLANA]: {
      fetch: fetch,
      start: getStartTimestamp,
      customBackfill: customBackfill(CHAIN.BSC as Chain, () => fetch)
    }
  },
};

export default adapter;
