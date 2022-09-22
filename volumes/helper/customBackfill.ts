import { ChainBlocks, Fetch } from "../dexVolume.type"
import { getBlock } from "../../projects/helper/getBlock"
import { chainsForBlocks } from "@defillama/sdk/build/computeTVL/blocks";
import { Chain } from "@defillama/sdk/build/general";

const ONE_HOUR_IN_SECONDS = 60 * 60 * 24

export type IGraphs = (chain: string) => (timestamp: number, chainBlocks: ChainBlocks) => Promise<{
    timestamp: number;
    block?: number;
    totalVolume: string;
    dailyVolume?: string;
}>

export default (chain: string, graphs: IGraphs): Fetch => async (timestamp: number, chainBlocks: ChainBlocks) => {
    const fetchGetVolume = graphs(chain)
    const resultDayN = await fetchGetVolume(timestamp, chainBlocks)
    const timestampPreviousDay = timestamp - ONE_HOUR_IN_SECONDS
    let chainBlocksPreviousDay = {}
    if (chainsForBlocks.includes(chain as Chain) || chain === "ethereum")
        chainBlocksPreviousDay = { [chain]: await getBlock(timestampPreviousDay, chain, {}).catch(() => { }) }
    const resultPreviousDayN = await fetchGetVolume(timestampPreviousDay, chainBlocksPreviousDay)
    return {
        block: resultDayN.block,
        timestamp: resultDayN.timestamp,
        totalVolume: resultDayN.totalVolume,
        dailyVolume: `${Number(resultDayN.totalVolume) - Number(resultPreviousDayN.totalVolume)}`,
    }
}