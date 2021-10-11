const sdk = require('@defillama/sdk')
const {transformXdaiAddress, transformOptimismAddress} = require('../helper/portedTokens')
const { getBlock } = require('../helper/getBlock')
const {chainExports} = require('../helper/exports')
const { default: axios } = require('axios')

function chainTvl(chain) {
    return async (timestamp, ethBlock, chainBlocks) => {
        const balances = {}
        let transform = token =>`${chain}:${token}`
        if(chain === "xdai"){
            transform = await transformXdaiAddress()
        } else if (chain === 'optimism'){
            transform = await transformOptimismAddress()
        }
        const block = await getBlock(timestamp, chain, chainBlocks)
        const tokens = await axios('https://raw.githubusercontent.com/hop-protocol/hop/develop/packages/core/build/addresses/mainnet.json')
        for (const tokenConstants of Object.values(tokens.data.bridges)) {
            const chainConstants = tokenConstants[chain]
            if (chainConstants === undefined) {
                continue
            }

            let token = chainConstants.l2CanonicalToken ?? chainConstants.l1CanonicalToken;
            let bridge = chainConstants.l2SaddleSwap ?? chainConstants.l1Bridge;
            if(token === "0x0000000000000000000000000000000000000000"){
                continue
            }

            const amount = await sdk.api.erc20.balanceOf({
                target: token,
                owner: bridge,
                block,
                chain
            })
            sdk.util.sumSingleBalance(balances, await transform(token), amount.output)
        }
        return balances
    }
}

module.exports = chainExports(chainTvl, ['ethereum', 'xdai', 'polygon', 'optimism', 'arbitrum'])