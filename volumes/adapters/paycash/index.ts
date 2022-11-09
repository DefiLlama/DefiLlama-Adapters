import axios from "axios";
import { Chain } from "@defillama/sdk/build/general";
import { SimpleVolumeAdapter } from "../../dexVolume.type";
import { CHAIN } from "../../helper/chains";
import customBackfill from "../../helper/customBackfill";
import { getUniqStartOfTodayTimestamp } from "../../helper/getUniSubgraphVolume";

const historicalVolumeEndpoint = "https://api.paycashswap.com/"
const requestBody = {
  operationName: "TotalVolume",
  query: "query TotalVolume {\n  totalVolumeChart {\n    value24h\n    lastWeekValue\n    percentageChange24h\n    points {\n      timestamp\n      value\n      __typename\n    }\n    __typename\n  }\n}\n",
  variables: {}
}

interface IVolumeall {
  value: string;
  timestamp: string;
}

const fetch = async (timestamp: number) => {
  const dayTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp * 1000))
  const historicalVolume: IVolumeall[] = (await axios.post(historicalVolumeEndpoint, requestBody))?.data.data.totalVolumeChart.points;
  const totalVolume = historicalVolume
    .filter(volItem => (new Date(volItem.timestamp).getTime() / 1000) <= dayTimestamp)
    .reduce((acc, { value }) => acc + Number(value), 0)

  const dailyVolume = historicalVolume
    .find(dayItem => (new Date(dayItem.timestamp).getTime() / 1000) === dayTimestamp)?.value

  return {
    totalVolume: `${totalVolume}`,
    dailyVolume: dailyVolume ? `${dailyVolume}` : undefined,
    timestamp: dayTimestamp,
  };
};


const adapter: SimpleVolumeAdapter = {
  volume: {
    [CHAIN.EOS]: {
      fetch,
      start: async () => 1618370204,
      customBackfill: customBackfill(CHAIN.EOS as Chain, (_chian: string) => fetch)
    },
  },
};

export default adapter;
