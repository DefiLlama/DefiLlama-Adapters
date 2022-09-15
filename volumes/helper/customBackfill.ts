import { Chain } from "@defillama/sdk/build/general"
import { ChainBlocks, Fetch } from "../dexVolume.type"
import { getBlock } from "../../projects/helper/getBlock"

const ONE_HOUR_IN_SECONDS = 60 * 60 * 24

export type IGraphs = (chain: Chain) => (timestamp: number, chainBlocks: ChainBlocks) => Promise<{
    timestamp: number;
    block?: number;
    totalVolume: string;
    dailyVolume?: string;
}>

export default (chain: Chain, graphs: IGraphs): Fetch => async (timestamp: number, chainBlocks: ChainBlocks) => {
    const fetchGetVolume = graphs(chain)
    const resultDayN = await fetchGetVolume(timestamp, chainBlocks)
    const timestampPreviousDay = timestamp - ONE_HOUR_IN_SECONDS
    const chainBlocksPreviousDay = (await getBlock(timestampPreviousDay, chain, {}))
    const resultPreviousDayN = await fetchGetVolume(timestampPreviousDay, { [chain]: chainBlocksPreviousDay })
    return {
        block: resultDayN.block,
        timestamp: resultDayN.timestamp,
        totalVolume: resultDayN.totalVolume,
        dailyVolume: `${Number(resultDayN.totalVolume) - Number(resultPreviousDayN.totalVolume)}`,
    }
}