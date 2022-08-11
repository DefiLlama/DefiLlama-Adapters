import { Chain } from "@defillama/sdk/build/general"
import { ChainBlocks, Fetch } from "../dexVolume.type"
import { getChainVolume } from "./getUniSubgraphVolume"
import { getBlock } from "../../projects/helper/getBlock"

export default (chain: Chain, graphs: ReturnType<typeof getChainVolume>): Fetch => async (timestamp: number, chainBlocks: ChainBlocks) => {
    const fetchGetVolume = graphs(chain)
    const resultDayN = await fetchGetVolume(timestamp, chainBlocks)
    const timestampPreviousDay = timestamp - 60 * 60 * 24
    const chainBlocksPreviousDay = (await getBlock(timestampPreviousDay, chain, {})) - 20
    const resultPreviousDayN = await fetchGetVolume(timestampPreviousDay, { [chain]: chainBlocksPreviousDay })
    return {
        block: resultDayN.block,
        timestamp: resultDayN.timestamp,
        totalVolume: resultDayN.totalVolume,
        dailyVolume: `${Number(resultDayN.totalVolume) - Number(resultPreviousDayN.totalVolume)}`,
    }
}