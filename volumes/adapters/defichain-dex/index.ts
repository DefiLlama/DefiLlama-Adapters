import fetchURL from "../../utils/fetchURL"
import { SimpleVolumeAdapter } from "../../dexVolume.type";
import { CHAIN } from "../../helper/chains";
import { getUniqStartOfTodayTimestamp } from "../../helper/getUniSubgraphVolume";

const historicalVolumeEndpoint = "https://ocean.defichain.com/v0/mainnet/poolpairs?size=1000"

interface IData {
  volume: IVolume;
}
interface IVolume {
  h24: number;
}

const fetch = async (timestamp: number) => {
  const dayTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp * 1000))
  const historicalVolume: IData[] = (await fetchURL(historicalVolumeEndpoint))?.data.data;
  const dailyVolume = historicalVolume
    .reduce((acc, { volume }) => acc + Number(volume.h24), 0)


  return {
    totalVolume: `0`,
    dailyVolume: dailyVolume ? `${dailyVolume}` : undefined,
    timestamp: dayTimestamp,
  };
};


const adapter: SimpleVolumeAdapter = {
  volume: {
    [CHAIN.DEFICHAIN]: {
      fetch,
      start: async () => 0,
      runAtCurrTime: true
    },
  },
};

export default adapter;
