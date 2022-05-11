import { DexVolumeAdapter } from "../dexVolume.type";
import { getTimestampAtStartOfHour } from "../helper/getTimestampAtStartOfHour";

const { request, gql } = require("graphql-request");
const BigNumber = require("bignumber.js");
const {
  getUniqStartOfTodayTimestamp,
} = require("../helper/getUniSubgraphVolume");

const endpoints = {
  terra: "https://terraswap-graph.terra.dev/graphql",
};

const historicalData = gql`
  query get_volume($from: Float!, $to: Float!) {
    terraswap {
      historicalData(from: $from, to: $to) {
        volumeUST
      }
    }
  }
`;

const fetch = async () => {
  const timestamp = getTimestampAtStartOfHour();
  const todayUnix = getUniqStartOfTodayTimestamp();
  const dailyVolumeRequest = await request(endpoints.terra, historicalData, {
    from: todayUnix,
    to: Math.floor(Date.now() / 1000),
  });

  const totalVolumeRequests = [];
  const days500 = 500 * 86400;

  for (let i = 1605254400; i < todayUnix; i += days500) {
    let to = i + days500 > todayUnix ? todayUnix : i + days500;
    totalVolumeRequests.push(
      request(endpoints.terra, historicalData, {
        from: i,
        to,
      })
    );
  }

  // fix types when redo adapter
  const allVolume = (await Promise.all(totalVolumeRequests)).reduce(
    (acc: any, graphRes) =>
      graphRes?.terraswap?.historicalData
        ?.reduce(
          (acc: any, { volumeUST }: any) => new BigNumber(volumeUST).plus(acc),
          new BigNumber(0)
        )
        .plus(acc),
    new BigNumber(0)
  );

  return {
    totalVolume: allVolume.toString(),
    dailyVolume: dailyVolumeRequest?.terraswap?.historicalData?.[0]?.volumeUST,
    timestamp,
  };
};

const adapter: DexVolumeAdapter = {
  volume: {
    terra: {
      fetch,
      runAtCurrTime: true,
      customBackfill: () => {},
      start: 0,
    },
    // TODO custom backfill
  },
};

export default adapter;
