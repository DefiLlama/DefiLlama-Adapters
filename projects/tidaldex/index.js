const { uniTvlExport, masterchefExports } = require('../helper/unknownTokens')

const FACTORY = '0x907e8C7D471877b4742dA8aA53d257d0d565A47E'
const FARM_MASTER = '0x348CF34aCD0aB88c3364037486234AB6cbC31C4d'
const CZB = '0xD963b2236D227a0302E19F2f9595F424950dc186'

module.exports = uniTvlExport('bsc', FACTORY)

// Attach staking + pool2 from MasterChef (pool 0 is CZB single-staking)
const farm = masterchefExports({ chain: 'bsc', masterchef: FARM_MASTER, nativeToken: CZB, useDefaultCoreAssets: true })
module.exports.bsc.staking = farm.bsc.staking
module.exports.bsc.pool2 = farm.bsc.pool2

module.exports.methodology = 'DEX TVL counts liquidity on TidalDex (Uniswap V2 fork) by summing the reserves of all pairs from the factory.'
module.exports.timetravel = true
module.exports.misrepresentedTokens = false

