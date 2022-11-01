import fetchURL from "../../utils/fetchURL"
import type { SimpleVolumeAdapter } from "../../dexVolume.type";
import { getUniqStartOfTodayTimestamp } from "../../helper/getUniSubgraphVolume";
import { CHAIN } from "../../helper/chains";

const URL = "https://mtgswap-api.fox.one/api/pairs"

interface IAPIResponse {
  volume_24h: string;
};

const fetch = async (timestamp: number) => {
  const dayTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp * 1000))
  const response: IAPIResponse[] = (await fetchURL(URL))?.data?.data.pairs;
  const dailyVolume = response
    .reduce((acc, { volume_24h }) => acc + Number(volume_24h), 0);

  return {
    dailyVolume: dailyVolume ? `${dailyVolume}` : undefined,
    timestamp: dayTimestamp,
  };
};

const adapter: SimpleVolumeAdapter = {
  volume: {
    [CHAIN.MIXIN]: {
      fetch,
      runAtCurrTime: true,
      customBackfill: undefined,
      start: async () => 0,
    },
  }
};

export default adapter;
