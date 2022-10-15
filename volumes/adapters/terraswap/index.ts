import { DISABLED_ADAPTER_KEY, SimpleVolumeAdapter } from "../../dexVolume.type";
import { CHAIN } from "../../helper/chains";
import disabledAdapter from "../../helper/disabledAdapter";

const { request, gql } = require("graphql-request");

const {
  getUniqStartOfTodayTimestamp,
} = require("../../helper/getUniSubgraphVolume");

const endpoints = {
  terra: "https://terraswap-graph.terra.dev/graphql",
};

const historicalData = gql`
  query get_volume($from: Float!, $to: Float!) {
    terraswap {
      historicalData(from: $from, to: $to) {
        volumeUST
        timestamp
      }
    }
  }
`;

interface IGraphResponse {
  terraswap: {
    historicalData: Array<{
      volumeUST: string,
      timestamp: number
    }>
  }
}
const fetch = async (timestamp: number) => {
  const dayTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp * 1000))
  const data: IGraphResponse = await request(endpoints.terra, historicalData, {
    from: dayTimestamp,
    to: dayTimestamp,
  });

  return {
    dailyVolume:
      data.terraswap.historicalData[0]?.volumeUST === "NaN"
        ? undefined
        : data.terraswap.historicalData[0]?.volumeUST,
    timestamp: dayTimestamp,
  };
};

const getStartTimestamp = async () => {
  const data: IGraphResponse = await request(endpoints.terra, historicalData, {
    from: Date.UTC(2020, 0, 1) / 1000,
    to: Date.UTC(2021, 0, 1) / 1000,
  });
  return data.terraswap.historicalData[data.terraswap.historicalData.length - 1].timestamp
}

const adapter: SimpleVolumeAdapter = {
  volume: {
    [CHAIN.TERRA]: {
      fetch,
      runAtCurrTime: true,
      start: getStartTimestamp,
    },
    [DISABLED_ADAPTER_KEY]: disabledAdapter
  },
};

export default adapter;
