const sdk = require('@defillama/sdk')
const {transformXdaiAddress} = require('../helper/portedTokens')
const { default: axios } = require('axios')

function chainTvl(chain) {
    return async (timestamp, ethBlock, chainBlocks) => {
        const balances = {}
        let transform = token =>`${chain}:${token}`
        if(chain === "xdai"){
            transform = await transformXdaiAddress()
        }
        const tokens = await axios.get('https://raw.githubusercontent.com/hop-protocol/hop/develop/packages/core/build/addresses/mainnet.json')
        for (const tokenConstants of Object.values(tokens.data.bridges)) {
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
            sdk.util.sumSingleBalance(balances, await transform(token), amount.output)
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