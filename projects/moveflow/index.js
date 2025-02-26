const ADDRESSES = require('../helper/coreAssets.json')


const { sumTokensExport } = require('./../helper/unwrapLPs')

module.exports = {
    occ: {
        tvl: sumTokensExport({ 
          owners: ['0x408BDA1fe3Ed15Dc6b06a00055a2894e5D79369E'],
          tokens: [ ADDRESSES.occ.WEDU],
        }),
    },
    
};