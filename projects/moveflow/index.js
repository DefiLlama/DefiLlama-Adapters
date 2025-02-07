

const { sumTokensExport } = require('./../helper/unwrapLPs')

module.exports = {
    occ: {
        tvl: sumTokensExport({ 
          owners: ['0x408BDA1fe3Ed15Dc6b06a00055a2894e5D79369E'],
          tokens: [ '0xd02E8c38a8E3db71f8b2ae30B8186d7874934e12'],
        }),
    },
    
};