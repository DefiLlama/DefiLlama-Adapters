const {joeV2Export} = require('../helper/traderJoeV2')

/**
 * Exports Trader Joe V2 configuration for SectorOne DEX on MegaETH network
 * @type {Object}
 * @property {Object} megaeth - Configuration for MegaETH network
 * @property {string} megaeth.factory - Factory contract address on MegaETH
 */
module.exports = joeV2Export({
    megaeth: {
        factory: '0x304BaEB300dD71CD76f771343E74612C2237a320',
    },
})