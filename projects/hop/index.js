const sdk = require('@defillama/sdk')
const tokens = require('./mainnet')

function chainTvl(chain) {
    return async (timestamp, ethBlock, chainBlocks) => {
        const balances = {}
        for (const tokenConstants of Object.values(tokens.bridges)) {
            const chainConstants = tokenConstants[chain]
            if (chainConstants === undefined) {
                throw new Error("Chain doesn't exist")
            }

            let token = chainConstants.l2CanonicalToken ?? chainConstants.l1CanonicalToken;
            let bridge = chainConstants.l2SaddleSwap ?? chainConstants.l1Bridge;

            const amount = await sdk.api.erc20.balanceOf({
                target: token,
                owner: bridge,
                block: chainBlocks[chain],
                chain: chain
            })
            sdk.util.sumSingleBalance(balances, token==="0x4ECaBa5870353805a9F068101A40E0f32ed605C6"?'0xdac17f958d2ee523a2206206994597c13d831ec7':`${chain}:${token}`, amount.output)
        }
        return balances
    }
}

module.exports = {
    ethereum: {
        tvl: chainTvl('ethereum')
    },
    xdai: {
        tvl: chainTvl('xdai')
    },
    polygon: {
        tvl: chainTvl('polygon')
    },
    tvl: sdk.util.sumChainTvls(['ethereum', 'xdai', 'polygon'].map(chainTvl))
}