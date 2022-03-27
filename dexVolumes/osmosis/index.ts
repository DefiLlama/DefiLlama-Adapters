import { DexVolumeAdapter } from "../dexVolume.type";
import { getTimestampAtStartOfHour } from "../helper/getTimestampAtStartOfHour";

const BigNumber = require("bignumber.js");
const { fetchURL } = require("../helper/utils");

const historicalVolumeEndpoint =
  "https://api-osmosis.imperator.co/volume/v1/historical/chart";
const dailyVolumeEndpoint = "https://api-osmosis.imperator.co/volume/v1/actual";

const graphs = async () => {
  const timestamp = getTimestampAtStartOfHour();
  const historicalVolume = (await fetchURL(historicalVolumeEndpoint))?.data;
  const dailyVolume = (await fetchURL(dailyVolumeEndpoint))?.data.value;

  const totalVolume = historicalVolume
    .reduce(
      (acc: typeof BigNumber, { value }: { value: string | number }) =>
        acc.plus(value),
      new BigNumber(0)
    )
    .plus(dailyVolume)
    .toString();

  return {
    totalVolume,
    dailyVolume,
    timestamp,
  };
};

const adapter: DexVolumeAdapter = {
  volume: {
    cosmos: {
      fetch: graphs,
      runAtCurrTime: true,
      customBackfill: () => {},
      start: 0,
    },
    // TODO custom backfill
  },
};

export default adapter;
