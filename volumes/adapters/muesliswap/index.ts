import { CHAIN } from "../../helper/chains";
import { univ2Adapter, getUniqStartOfTodayTimestamp } from "../../helper/getUniSubgraphVolume";
import axios from "axios";
import { Chain } from "@defillama/sdk/build/general";
import customBackfill from "../../helper/customBackfill";


interface IVolumeall {
  time: number;
  volume: number;
};

const historicalVolumeEndpoint = "https://analyticsv3.muesliswap.com/historical-volume";

const fetch = async (timestamp: number) => {
  const dayTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp*1000))
  const vols: IVolumeall[] = (await axios.get(historicalVolumeEndpoint))?.data;
  const totalVolume = vols
    .filter(volItem => (new Date(volItem.time).getTime()) <= dayTimestamp)
    .reduce((acc, { volume }) => acc + Number(volume), 0);

  const dailyVolume = vols
    .find(dayItem => (new Date(dayItem.time).getTime()) === dayTimestamp)?.volume

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
  return (new Date(historicalVolume[0].time).getTime());
}




const adapters = (() => {
    const milkomeda = univ2Adapter({
        [CHAIN.MILKOMEDA]: "https://milkomeda.muesliswap.com/graph/subgraphs/name/muesliswap/exchange"
      }, {
      factoriesName: "pancakeFactories",
      dayData: "pancakeDayData",
    });

    milkomeda.volume[CHAIN.CARDADO] = {
      start: getStartTimestamp,
      fetch: fetch,
      // customBackfill: customBackfill(CHAIN.CARDADO as Chain, (_chain: string) => fetch)
    };
    return milkomeda
})();

adapters.volume.milkomeda.start = async () => 1648427924;
export default adapters;
