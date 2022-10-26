import { ChainBlocks } from "../dexVolume.type";
import axios from "axios"
import { providers } from "@defillama/sdk/build/general"
import type { Chain } from "@defillama/sdk/build/general"
import { CHAIN } from "./chains";
import * as sdk from "@defillama/sdk"
const retry = require("async-retry")

async function getBlock(timestamp: number, chain: Chain, chainBlocks: ChainBlocks, undefinedOk: boolean = false) {
    if (chainBlocks[chain] !== undefined || (process.env.HISTORICAL === undefined && undefinedOk)) {
        return chainBlocks[chain]
    } else {
        if (chain === CHAIN.CELO) {
            return Number((await retry(async () => await axios.get("https://explorer.celo.org/api?module=block&action=getblocknobytime&timestamp=" + timestamp + "&closest=before"))).data.result.blockNumber);
        } else if (chain === CHAIN.MOONRIVER) {
            return Number((await retry(async () => await axios.get(`https://blockscout.moonriver.moonbeam.network/api?module=block&action=getblocknobytime&timestamp=${timestamp}&closest=before`))).data.result.blockNumber);
        }
        return sdk.api.util.lookupBlock(timestamp, { chain }).then(blockData => blockData.block)
    }
}

const canGetBlock = (chain: string) => Object.keys(providers).includes(chain)

export {
    getBlock,
    canGetBlock
}
