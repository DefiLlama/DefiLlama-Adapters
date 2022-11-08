import { SimpleVolumeAdapter } from "../../dexVolume.type";
import { CHAIN } from "../../helper/chains";
import { getUniqStartOfTodayTimestamp } from "../../helper/getUniSubgraphVolume";
import axios from "axios";

const historicalVolumeEndpoint = (to: number) =>`https://server.saucerswap.finance/api/public/stats/platformData?field=VOLUME&interval=DAY&from=1633997&to=${to}`

interface IVolumeall {
  timestampSeconds: string;
  valueHbar: string;
}

const fetch = async (timestamp: number) => {
  const dayTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp * 1000))
  const historicalVolume: IVolumeall[] = (await axios.get(historicalVolumeEndpoint(dayTimestamp), { headers: {
    'origin': 'https://analytics.saucerswap.finance',
  }}))?.data;

  const totalVolume = historicalVolume
    .filter(volItem => Number(volItem.timestampSeconds) <= dayTimestamp)
    .reduce((acc, { valueHbar }) => acc + Number(valueHbar), 0)

  const dailyVolume = historicalVolume
    .find(dayItem => Number(dayItem.timestampSeconds) === dayTimestamp)?.valueHbar

  const prices = await axios.post('https://coins.llama.fi/prices', {
    "coins": [
      "coingecko:hedera-hashgraph",
    ],
    timestamp: dayTimestamp
  });

  return {
    totalVolume: totalVolume ? String(totalVolume/1e8 * prices.data.coins["coingecko:hedera-hashgraph"].price) : "0",
    dailyVolume: dailyVolume ? String(Number(dailyVolume)/1e8 * prices.data.coins["coingecko:hedera-hashgraph"].price) : "0",
    timestamp: dayTimestamp,
  };
};


const adapter: SimpleVolumeAdapter = {
  volume: {
    [CHAIN.HEDERA]: {
      fetch,
      start: async () => 1659571200,
    },
  },
};

export default adapter;
