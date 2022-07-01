declare module '*/getBlock' {
    function getBlock(timestamp: number, chain: Chain, chainBlocks: ChainBlocks, undefinedOk?: boolean): Promise<number | ChainBlocks['']>
}