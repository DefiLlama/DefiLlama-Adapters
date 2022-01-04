const sdk = require('@defillama/sdk')
const { transformXdaiAddress, transformOptimismAddress } = require('../helper/portedTokens')
const { getBlock } = require('../helper/getBlock')
const { chainExports } = require('../helper/exports')
const { default: axios } = require('axios')

const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
function chainTvl(chain) {
    return async (timestamp, ethBlock, chainBlocks) => {
        const balances = {}
        let transform = token => `${chain}:${token}`
        if (chain === "xdai") {
            transform = await transformXdaiAddress()
        } else if (chain === 'optimism') {
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
            let amount;
            if (token === "0x0000000000000000000000000000000000000000" && chain === "ethereum") {
                token = WETH
                amount = await sdk.api.eth.getBalance({
                    target: bridge,
                    block,
                    chain
                })
            } else {
                amount = await sdk.api.erc20.balanceOf({
                    target: token,
                    owner: bridge,
                    block,
                    chain
                })
            }
            sdk.util.sumSingleBalance(balances, await transform(token), amount.output)
        }
        if (chain === "ethereum") {
            for (const bonder of Object.entries(tokens.data.bonders)) {
                const tokenName = bonder[0]
                for (const contract of bonder[1]) {
                    if (tokenName === "ETH") {
                        const amount = await sdk.api.eth.getBalance({
                            target: contract,
                            block,
                        })
                        sdk.util.sumSingleBalance(balances, WETH, amount.output)
                    } else {
                        const token = tokens.data.bridges[tokenName].ethereum.l1CanonicalToken
                        const amount = await sdk.api.erc20.balanceOf({
                            target: token,
                            owner: contract,
                            block,
                        })
                        sdk.util.sumSingleBalance(balances, token, amount.output)
                    }
                }
            }
        }
        return balances
    }
}

module.exports = chainExports(chainTvl, ['ethereum', 'xdai', 'polygon', 'optimism', 'arbitrum'])