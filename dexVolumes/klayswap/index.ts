import { DexVolumeAdapter } from "../dexVolume.type";
import { getTimestampAtStartOfHour } from "../helper/getTimestampAtStartOfHour";

const BigNumber = require("bignumber.js");
const { fetchURL } = require("../helper/utils");

const historicalVolumeEndpoint =
  "https://s.klayswap.com/stat/klayswapInfo.json";

const fetch = async () => {
  const timestamp = getTimestampAtStartOfHour();
  const historicalVolume = (await fetchURL(historicalVolumeEndpoint))?.data
    .dayVolume;

  const totalVolume = historicalVolume
    .reduce(
      (acc: typeof BigNumber, { amount }: { amount: string | number }) =>
        acc.plus(amount),
      new BigNumber(0)
    )
    .toString();

  return {
    timestamp,
    totalVolume,
    dailyVolume: historicalVolume[historicalVolume.length - 1].amount,
  };
};

const adapter: DexVolumeAdapter = {
  volume: {
    klatyn: {
      fetch,
      runAtCurrTime: true,
      customBackfill: () => {},
      start: 0,
    },
    // TODO custom backfill
  },
};

export default adapter;
