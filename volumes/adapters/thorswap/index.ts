import fetchURL from "../../utils/fetchURL"
import { Chain } from "@defillama/sdk/build/general";
import { SimpleVolumeAdapter } from "../../dexVolume.type";
import { CHAIN } from "../../helper/chains";
import customBackfill from "../../helper/customBackfill";
import { getUniqStartOfTodayTimestamp } from "../../helper/getUniSubgraphVolume";
import axios from "axios";

const historicalVolumeEndpoint = "https://midgard.thorswap.net/v2/history/swaps?interval=day&count=100"

interface IVolumeall {
  totalFees: string;
  runePriceUSD: string;
  synthRedeemFees: string;
  synthMintFees: string;
  toRuneFees: string;
  totalVolume: string;
  startTime: string;
}

const calVolume = (total: IVolumeall): number => {
  const runePriceUSD = Number(total.runePriceUSD);
  const volume = (Number(total.totalVolume)/10^8)*runePriceUSD
  const fee1 = (Number(total.totalFees)/10^8)*runePriceUSD;
  const fee2 = (Number(total.synthRedeemFees)/10^8)*runePriceUSD;
  const fee3 = (Number(total.synthMintFees)/10^8)*runePriceUSD;
  const fee4 = (Number(total.toRuneFees)/10^8)*runePriceUSD;
  return volume - (fee1 + fee2 + fee3 + fee4);
};
const headers = {
  "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "cache-control": "no-cache",
  "origin": "https://app.thorswap.finance",
  "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36"
}
const fetch = async (timestamp: number) => {
  const dayTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp * 1000))
  const historicalVolume: IVolumeall[] = (await axios.get(historicalVolumeEndpoint, {  headers }))?.data.intervals;
  const totalVolume = historicalVolume
    .filter(volItem => getUniqStartOfTodayTimestamp(new Date(volItem.startTime)) <= dayTimestamp)
    .reduce((acc, res) => acc + calVolume(res), 0);
  const dailyVolumeCall = historicalVolume
    .find(dayItem => getUniqStartOfTodayTimestamp(new Date(dayItem.startTime)) === dayTimestamp);
  const dailyVolume = calVolume(dailyVolumeCall);

  return {
    totalVolume: `${totalVolume}`,
    dailyVolume: dailyVolume ? `${dailyVolume}` : undefined,
    timestamp: dayTimestamp,
  };
};

const getStartTimestamp = async () => {
  const historicalVolume: IVolumeall[] = (await axios.get(historicalVolumeEndpoint, { headers }))?.data.intervals;
  return (new Date(historicalVolume[0].startTime).getTime()) / 1000
}

const adapter: SimpleVolumeAdapter = {
  volume: {
    [CHAIN.TRON]: {
      fetch,
      start: async () =>0,
      customBackfill: customBackfill(CHAIN.TRON as Chain, (_chian: string) => fetch)
    },
  },
};

export default adapter;
