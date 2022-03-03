import { DexVolumeAdapter } from "../dexVolume.type";
import { getTimestampAtStartOfHour } from "../helper/getTimestampAtStartOfHour";

const BigNumber = require("bignumber.js");
const { fetchURL } = require("../helper/utils");
const {
  getUniqStartOfTodayTimestamp,
} = require("../helper/getUniSubgraphVolume");

const endpoints = {
  ethereum: (date: number) =>
    `https://api-v2.bancor.network/history/volume?interval=hour&start_date=${date}`,
};

const graphs = (chain: string) => async () => {
  const timestamp = getTimestampAtStartOfHour();

  let res;
  switch (chain) {
    case "ethereum":
      res = await fetchURL(endpoints.ethereum(getUniqStartOfTodayTimestamp()));
    default:
      res = await fetchURL(endpoints.ethereum(getUniqStartOfTodayTimestamp()));
  }

  const todayHourlyData = res?.data?.data;

  return {
    totalVolume: "0", //@TODO FIX
    dailyVolume: todayHourlyData
      .reduce(
        (acc: any, { usd }: any) => acc.plus(BigNumber(usd)),
        new BigNumber(0)
      )
      .toString(),
    timestamp,
  };
};

const adapter: DexVolumeAdapter = {
  volume: {
    ethereum: {
      fetch: graphs("ethereum"),
      runAtCurrTime: true,
      customBackfill: () => {},
      start: 0,
    },
    // CUSTOM BACKFILL
  },
};

export default adapter;
