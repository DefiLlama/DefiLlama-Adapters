const { chainExports } = require('../helper/exports')
const { default: axios } = require('axios')
const { sumTokens2 } = require('../helper/unwrapLPs')

// node test.js projects/hop/index.js
function chainTvl(chain) {
    return async (_, _b, {[chain]: block}) => {
        const toa = []
        const tokens = await axios('https://raw.githubusercontent.com/hop-protocol/hop/develop/packages/core/build/addresses/mainnet.json')
        for (const tokenConstants of Object.values(tokens.data.bridges)) {
            const chainConstants = (chain == 'xdai' ? tokenConstants['gnosis'] : tokenConstants[chain])
            if (chainConstants === undefined)
                continue

            let token = chainConstants.l2CanonicalToken ?? chainConstants.l1CanonicalToken;
            let bridge = chainConstants.l2SaddleSwap ?? chainConstants.l1Bridge;
            toa.push([token, bridge])
        }
        if (chain === "ethereum") {
            for (const bonder of Object.entries(tokens.data.bonders)) {
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
                    const token = tokens.data.bridges[tokenName].ethereum.l1CanonicalToken
                    toa.push([token, contract])
                }
            }
        }
        return sumTokens2({ chain, tokensAndOwners: toa, block, })
    }
}

module.exports = chainExports(chainTvl, ['ethereum', 'xdai', 'polygon', 'optimism', 'arbitrum'])