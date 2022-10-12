import fetchURL from "../../utils/fetchURL"
import { ChainBlocks, SimpleVolumeAdapter } from "../../dexVolume.type";
import { CHAIN } from "../../helper/chains";
import customBackfill from "../../helper/customBackfill";
import { getUniqStartOfTodayTimestamp } from "../../helper/getUniSubgraphVolume";

const historicalVolumeEndpoint = "https://info.mdex.one/pair/volume/statistics/max"

interface IVolume {
  swap_count: string;
  created_time: string;
  max_swap_amount: string;
}
type ChainMapId = {
  [chain: string]: number;
}
const mapChainId: ChainMapId = {
  "bsc": 56,
};

const fetch = async (timestamp: number, chainBlocks: ChainBlocks) => {
  const queryByChainId = `?chain_id=${mapChainId[Object.keys(chainBlocks)[0]]}`;
  const dayTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp * 1000));
  const historicalVolume: IVolume[] = (await fetchURL(`${historicalVolumeEndpoint}${queryByChainId}`))?.data.result;
  const totalVolume = historicalVolume
    .filter(volItem => (new Date(volItem.created_time).getTime() / 1000) <= dayTimestamp)
    .reduce((acc, { max_swap_amount }) => acc + Number(max_swap_amount), 0)

  const dailyVolume = historicalVolume
    .find(dayItem => (new Date(dayItem.created_time).getTime() / 1000) === dayTimestamp)?.max_swap_amount

  return {
    totalVolume: `${totalVolume}`,
    dailyVolume: dailyVolume ? `${dailyVolume}` : undefined,
    timestamp: dayTimestamp,
  };
};

const getStartTimestamp = async (chain_id: number) => {
  const queryByChainId = `?chain_id=${chain_id}`;
  const historicalVolume: IVolume[] = (await fetchURL(`${historicalVolumeEndpoint}${queryByChainId}`))?.data.result;
  return (new Date(historicalVolume[0].created_time).getTime()) / 1000
}
const adapter: SimpleVolumeAdapter = {
  volume: {
    bsc: {
      fetch,
      start: () => getStartTimestamp(56),
      customBackfill: customBackfill(CHAIN.BSC, (_chian: string) => fetch)
    },
  },
};

export default adapter;
