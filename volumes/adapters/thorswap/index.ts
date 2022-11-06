import axios from "axios";
import { SimpleVolumeAdapter } from "../../dexVolume.type";
import { CHAIN } from "../../helper/chains";
import { getUniqStartOfTodayTimestamp } from "../../helper/getUniSubgraphVolume";

const historicalVolumeEndpoint = "https://midgard.ninerealms.com/v2/history/swaps?interval=day&count=100"

interface IVolumeall {
  totalFees: string;
  toAssetFees: string;
  runePriceUSD: string;
  synthRedeemFees: string;
  synthMintFees: string;
  toRuneFees: string;
  totalVolume: string;
  startTime: string;
  toRuneVolume: string;
}

const calVolume = (total: IVolumeall): number => {
  const runePriceUSD = Number(total?.runePriceUSD || 0);
  const volume = Number(total.totalVolume || 0) / 1e8 * runePriceUSD
  return volume;
};

const fetch = async (timestamp: number) => {
  const dayTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp * 1000))
  const historicalVolume: IVolumeall[] = (await axios.get(historicalVolumeEndpoint))?.data.intervals;
  const totalVolume = historicalVolume
    .filter(volItem => Number(volItem.startTime) <= dayTimestamp)
    .reduce((acc, res) => acc + calVolume(res), 0);
  const dailyVolumeCall = historicalVolume.find((dayItem: IVolumeall) => Number(dayItem.startTime) === dayTimestamp);
  const dailyVolume = calVolume(dailyVolumeCall as IVolumeall);

  return {
    totalVolume: `${totalVolume}`,
    dailyVolume: dailyVolume ? `${dailyVolume}` : undefined,
    timestamp: dayTimestamp,
  };
};

const getStartTimestamp = async () => {
  const historicalVolume: IVolumeall[] = (await axios.get(historicalVolumeEndpoint))?.data.intervals;
  return Number(historicalVolume[0]?.startTime);
}

const adapter: SimpleVolumeAdapter = {
  volume: {
    [CHAIN.THORCHAIN]: {
      fetch,
      start: getStartTimestamp,
    },
  },
};

export default adapter;
