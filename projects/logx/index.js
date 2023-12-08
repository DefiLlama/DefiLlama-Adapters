const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
    methodology: 'USDC.e in the vault',
    linea: {
        tvl: sumTokensExport({ owners: [
            "0xC5f444D25D5013C395F70398350d2969eF0F6AA0",
        ], tokens: [
            ADDRESSES.linea.USDC
        ]}),
    }
}; 