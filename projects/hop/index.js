const { chainExports } = require('../helper/exports')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getConfig } = require('../helper/cache')

const chainMapping = {
    xdai: 'gnosis',
    arbitrum_nova: 'nova'
}
const getChainKey = chain => chainMapping[chain] ?? chain

// node test.js projects/hop/index.js
function chainTvl(chain) {
    return async (_, _b, {[chain]: block}) => {
        const toa = []
        const { bridges, bonders } = await getConfig('hop-protocol', 'https://s3.us-west-1.amazonaws.com/assets.hop.exchange/mainnet/v1-core-config.json')
        for (const tokenConstants of Object.values(bridges)) {
            const chainConstants = tokenConstants[getChainKey(chain)]
            if (chainConstants === undefined)
                continue

            let token = chainConstants.l2CanonicalToken ?? chainConstants.l1CanonicalToken;
            let bridge = chainConstants.l2SaddleSwap ?? chainConstants.l1Bridge;
            toa.push([token, bridge])
        }
        if (chain === "ethereum") {
            for (const bonder of Object.entries(bonders)) {
                const tokenName = bonder[0]
                let contractList = []
                for (let i of Object.values(bonder[1])) {
                    for (let j of Object.values(i)) {
                        if (contractList.includes(j.toLowerCase())) {
                            continue;
                        } else {
                            contractList.push(j.toLowerCase())
                        }
                    }
                }
                for (const contract of contractList) {
                    const token = bridges[tokenName].ethereum.l1CanonicalToken
                    toa.push([token, contract])
                }
            }
        }
        return sumTokens2({ chain, tokensAndOwners: toa, block, })
    }
}

module.exports = chainExports(chainTvl, ['base', 'ethereum', 'polygon', 'optimism', 'arbitrum', ...Object.keys(chainMapping)])