const { fetchURL } = require("../../helper/utils");
import { Chain } from "@defillama/sdk/build/general";
import { SimpleVolumeAdapter } from "../../dexVolume.type";
import { CHAIN } from "../../helper/chains";
import customBackfill from "../../helper/customBackfill";
import { getUniqStartOfTodayTimestamp } from "../../helper/getUniSubgraphVolume";


const historicalVolumeEndpoint = "https://izumi.finance/api/v1/izi_swap/summary_record/?chain_id=56&type=4&page_size=100000"

interface IVolumeall {
  volDay: number;
  chainId: number;
  timestamp: number;
}
type TChains = {
  [k: Chain | string]: number;
};

const chains: TChains =  {
  [CHAIN.BSC]: 56,
};

const fetch = (chain: Chain) => {
  return async (timestamp: number) => {
    const dayTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp * 1000))
    const historical: IVolumeall[] = (await fetchURL(historicalVolumeEndpoint))?.data.data;
    const historicalVolume = historical.filter(e => e.chainId === chains[chain]);
    const totalVolume = historicalVolume
      .filter(volItem => (new Date(volItem.timestamp).getTime()) <= dayTimestamp)
      .reduce((acc, { volDay }) => acc + Number(volDay), 0)

    const dailyVolume = historicalVolume
      .find(dayItem => (new Date(dayItem.timestamp).getTime()) === dayTimestamp)?.volDay

    return {
      totalVolume: `${totalVolume}`,
      dailyVolume: dailyVolume ? `${dailyVolume}` : undefined,
      timestamp: dayTimestamp,
    };
  }
};

const getStartTimestamp = async (chain_id: number) => {
  const historical: IVolumeall[] = (await fetchURL(historicalVolumeEndpoint))?.data.data;
  const historicalVolume = historical.filter(e => e.chainId === chain_id);
  return (new Date(historicalVolume[historicalVolume.length - 1].timestamp).getTime());
}

const adapter: SimpleVolumeAdapter = {
  volume: {
    [CHAIN.BSC]: {
      fetch: fetch(CHAIN.BSC),
      start: () => getStartTimestamp(56),
      customBackfill: customBackfill(CHAIN.BSC as Chain, fetch)
    },
  },
};

export default adapter;
