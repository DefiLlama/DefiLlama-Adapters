import fetchURL from "../../utils/fetchURL"
import type { SimpleVolumeAdapter } from "../../dexVolume.type";
import { getUniqStartOfTodayTimestamp } from "../../helper/getUniSubgraphVolume";
import { CHAIN } from "../../helper/chains";

const URL = "https://api.pact.fi/api/pools?limit=1000"

interface IAPIResponse {
  volume_24h: string;
};

const fetch = async (timestamp: number) => {
  const dayTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp * 1000))
  const response: IAPIResponse[] = (await fetchURL(URL)).data.results;
  const dailyVolume = response
    .reduce((acc, { volume_24h }) => acc + Number(volume_24h), 0)

  return {
    dailyVolume: `${dailyVolume}`,
    timestamp: dayTimestamp,
  };
};

const adapter: SimpleVolumeAdapter = {
  volume: {
    [CHAIN.ALGORAND]: {
      fetch,
      runAtCurrTime: true,
      customBackfill: undefined,
      start: async () => 0,
    },
  }
};

export default adapter;
