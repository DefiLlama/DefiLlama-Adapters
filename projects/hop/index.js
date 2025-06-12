const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getConfig } = require('../helper/cache')

const chainMapping = {
    xdai: 'gnosis',
    arbitrum_nova: 'nova'
}
const getChainKey = chain => chainMapping[chain] ?? chain
const isValidAddress = (addr) => /^0x[a-fA-F0-9]{40}$/.test(addr)

// node test.js projects/hop/index.js
function chainTvl(chain) {
    return async (api) => {
        let toa = []
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
                        const address = j.toLowerCase().trim()
                        if (!contractList.includes(address)) {
                            contractList.push(address)
                        }
                    }
                }
                for (const contract of contractList) {
                    const token = bridges[tokenName].ethereum.l1CanonicalToken?.trim()
                    toa.push([token, contract])
                }
            }
        }
        toa = toa.filter(([i, j]) => i && j && j !== ADDRESSES.null && isValidAddress(i) && isValidAddress(j))
        return sumTokens2({ api, tokensAndOwners: toa, })
    }
}

const chains = ['base', 'ethereum', 'polygon', 'optimism', 'arbitrum', ...Object.keys(chainMapping)]

chains.forEach(chain => {
    module.exports[chain] = { tvl: chainTvl(chain) }
})