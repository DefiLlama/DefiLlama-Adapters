import fetchURL from "../../utils/fetchURL"
import type { SimpleVolumeAdapter } from "../../dexVolume.type";
import { getUniqStartOfTodayTimestamp } from "../../helper/getUniSubgraphVolume";
import { CHAIN } from "../../helper/chains";

const URL = "https://thf1cmidt1.execute-api.us-east-2.amazonaws.com/Prod/amm_protocol_snapshot/?network=MAINNET"

interface IAPIResponse {
  total_usd: number;
};

const fetch = async (timestamp: number) => {
  const dayTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp * 1000))
  const response: IAPIResponse = (await fetchURL(URL))?.data.protocol_snapshot.volume.day;

  return {
    dailyVolume: `${response.total_usd}`,
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
