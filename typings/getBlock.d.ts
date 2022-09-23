type ChainBlocks = {
    [chain: string]: number
} //tmp fix
type Chain = string

declare module '*/getBlock' {
    function getBlock(timestamp: number, chain: Chain, chainBlocks: ChainBlocks, undefinedOk?: boolean): Promise<number | ChainBlocks['']>
}