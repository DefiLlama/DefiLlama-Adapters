import { SimpleVolumeAdapter } from "../../dexVolume.type";
import { CHAIN } from "../../helper/chains";
import { getUniqStartOfTodayTimestamp } from "../../helper/getUniSubgraphVolume";
import axios from "axios";

const historical = "https://moonswap.fi/api/route/opt/swap/dashboard/global-chart";
const START_TIME = 1634515198;

interface IVolumeall {
  dailyVolumeUSD: string;
  date: number;
}

const fetch = async (timestamp: number) => {
  const dayTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp * 1000))
  const historicalVolume: IVolumeall[] = (await axios.post(historical, {start_time: START_TIME, skip: 0}))?.data.data.uniswapDayDatas;

  const totalVolume = historicalVolume
    .filter(volItem => Number(volItem.date) <= dayTimestamp)
    .reduce((acc, { dailyVolumeUSD }) => acc + Number(dailyVolumeUSD), 0);

  const dailyVolume = historicalVolume
    .find(dayItem => Number(dayItem.date) === dayTimestamp)?.dailyVolumeUSD

  return {
    totalVolume: `${totalVolume}`,
    dailyVolume: dailyVolume ? `${dailyVolume}` : undefined,
    timestamp: dayTimestamp,
  };
};


const adapter: SimpleVolumeAdapter = {
  volume: {
    [CHAIN.CONFLUX]: {
      fetch,
      start: async () => START_TIME,
    },
  },
};

export default adapter;
