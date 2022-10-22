import fetchURL from "../../utils/fetchURL"
import { SimpleVolumeAdapter } from "../../dexVolume.type";
import { CHAIN } from "../../helper/chains";
import { getUniqStartOfTodayTimestamp } from "../../helper/getUniSubgraphVolume";
import axios from "axios";

const historicalVolumeEndpoint = "https://bisq.markets/bisq/api/markets/volumes?interval=day"

interface IVolumeall {
  volume: string;
  period_start: number;
}

const fetch = async (timestamp: number) => {
  const dayTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp * 1000))
  const historicalVolume: IVolumeall[] = (await fetchURL(historicalVolumeEndpoint))?.data;
  const totalVolume = historicalVolume
    .filter(volItem => volItem.period_start <= dayTimestamp)
    .reduce((acc, { volume }) => acc + Number(volume), 0)

  const dailyVolume = historicalVolume
    .find(dayItem => dayItem.period_start === dayTimestamp)?.volume

  const prices = await axios.post('https://coins.llama.fi/prices', {
    "coins": [
      "coingecko:bitcoin",
    ],
    timestamp: dayTimestamp
  });

  return {
    totalVolume: totalVolume ? String(Number(totalVolume) * prices.data.coins["coingecko:bitcoin"].price) : "0",
    dailyVolume: dailyVolume ? String(Number(dailyVolume) * prices.data.coins["coingecko:bitcoin"].price) : "0",
    timestamp: dayTimestamp,
  };
};

const getStartTimestamp = async () => {
  const historicalVolume: IVolumeall[] = (await fetchURL(historicalVolumeEndpoint))?.data;
  return  historicalVolume[0].period_start;
}

const adapter: SimpleVolumeAdapter = {
  volume: {
    [CHAIN.BITCOIN]: {
      fetch,
      start: getStartTimestamp,
    },
  },
};

export default adapter;
