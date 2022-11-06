import axios from "axios";
import type { SimpleVolumeAdapter } from "../../dexVolume.type";
import { CHAIN } from "../../helper/chains";
import { getUniqStartOfTodayTimestamp } from "../../helper/getUniSubgraphVolume";


interface IVolumeall {
  time: number;
  volume: number;
};

const historicalVolumeEndpoint = "https://api-mainnet-prod.minswap.org/defillama/volume-series";

const fetch = async (timestamp: number) => {
  const dayTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp * 1000))
  const vols: IVolumeall[] = (await axios.get(historicalVolumeEndpoint))?.data;
  const totalVolume = vols
    .filter(volItem => (new Date(volItem.time).getTime() / 1000) <= dayTimestamp)
    .reduce((acc, { volume }) => acc + Number(volume), 0);

  const dailyVolume = vols
    .find(dayItem => (new Date(dayItem.time).getTime() / 1000) === dayTimestamp)?.volume

  const prices = await axios.post('https://coins.llama.fi/prices', {
    "coins": [
      "coingecko:cardano",
    ],
    timestamp: dayTimestamp
  });

  return {
    timestamp: dayTimestamp,
    totalVolume: totalVolume ? String(totalVolume/1e6 * prices.data.coins["coingecko:cardano"].price) : "0",
    dailyVolume: dailyVolume ? String(dailyVolume/1e6 * prices.data.coins["coingecko:cardano"].price) : "0"
  }
}

const getStartTimestamp = async () => {
  const historicalVolume: IVolumeall[] = (await axios.get(historicalVolumeEndpoint))?.data;
  return (new Date(historicalVolume[0].time).getTime()) / 1000;
}

const adapter: SimpleVolumeAdapter = {
  volume: {
    [CHAIN.CARDADO]: {
      start: getStartTimestamp,
      fetch: fetch,
    }
  }
};

export default adapter;
