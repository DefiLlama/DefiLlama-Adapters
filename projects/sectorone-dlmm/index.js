const { joeV2Export } = require('../helper/traderJoeV2')

module.exports = joeV2Export({
    ethereum: '0x9d8688043150c2B2A4cdCE2eD03eB40b6cCd2c57',
    base: {
        factories: ['0x3357f02fB3aA78fc86D3Bccdc5Edf039D4b952B5', { factory: '0x217da3e53F221D1f36e8b09bc7d55d4012C0aa70', isLb: true, }]
    },
    megaeth: '0x304BaEB300dD71CD76f771343E74612C2237a320',
})
