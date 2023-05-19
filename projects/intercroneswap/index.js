const sdk = require('@defillama/sdk')
const { chainExports: getChainExports } = require('../helper/exports.js')
const { getUniTVL } = require('../helper/unknownTokens.js')
const { tronDex } = require('../helper/chain/tron-dex.js')

const TRON_FACTORY_V2 = 'TPvaMEL5oY2gWsJv7MDjNQh2dohwvwwVwx'
const TRON_FACTORY_V1 = 'TJL9Tj2rf5WPUkaYMzbvWErn6M8wYRiHG7'
const factories = {
  bsc: "0xFa51B0746eb96deBC619Fd2EA88d5D8B43BD8230",
  bittorrent: "0x5f4f1a36b7c141a12817580bc35277955c0afd78",
}

function chainTvl(chain) {
  return getUniTVL({ chain, factory: factories[chain], useDefaultCoreAssets: false, })
}

const chainExports = getChainExports(chainTvl, Object.keys(factories))

chainExports.misrepresentedTokens = true
chainExports.timetravel = true

module.exports = {
  ...chainExports,
  tron: {
    tvl: sdk.util.sumChainTvls([tronDex({ factory: TRON_FACTORY_V1}), tronDex({ factory: TRON_FACTORY_V2})])
  }
} 
