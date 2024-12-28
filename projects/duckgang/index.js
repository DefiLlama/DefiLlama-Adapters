const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')

module.exports = {
    methodology: 'SEI in vaults',
    sei: {
        tvl: sumTokensExport({ owners: 
            [
              "0x325a0E5C84B4d961B19161956f57Ae8bA5Bb3c26", //No lock-up
              "0x4F636e75B0b56DF397c8a7E47041e1E6b9738a4e", // 30 days
              "0xE4c779eDD8FE0e232d460273945b6b7A8c097EA2", // 60 days
              "0x3D75916B2d8279282C5e25A24fe2Ed57111C22ed", // 90 days
        ], tokens: [
            nullAddress
        ]}),
    }
}; 