const { chainExports: getChainExports } = require('../helper/exports.js')
const { getUniTVL } = require('../helper/unknownTokens.js')

const factories = {
    tron: "0x991255549e4fd299f03acd368497366cb9a2bfb0",
    bsc: "0xFa51B0746eb96deBC619Fd2EA88d5D8B43BD8230",
    bittorrent: "0x5f4f1a36b7c141a12817580bc35277955c0afd78",

}

function chainTvl(chain) {
    return getUniTVL({ chain, factory: factories[chain], useDefaultCoreAssets: true, })
}

const chainExports = getChainExports(chainTvl, Object.keys(factories))

chainExports.misrepresentedTokens = true
chainExports.timetravel = true

module.exports = chainExports
