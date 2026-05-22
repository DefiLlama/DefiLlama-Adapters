const {joeV2Export} = require('../helper/traderJoeV2')

/**
 * Exports Trader Joe V2 configuration for SectorOne DEX on MegaETH, Ethereum, Base network
 * @type {Object}
 * @property {Object} megaeth - Configuration for MegaETH, Ethereum, Base network
 * @property {string} megaeth.factory - Factory contract address on MegaETH, Ethereum, Base
 */
module.exports = joeV2Export({
    ethereum: {
        factory: '0x9d8688043150c2B2A4cdCE2eD03eB40b6cCd2c57',
    },
    base: {
        factory: '0x3357f02fB3aA78fc86D3Bccdc5Edf039D4b952B5',
    },
    megaeth: {
        factory: '0x304BaEB300dD71CD76f771343E74612C2237a320',
    },
})