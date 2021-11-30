const {getCompoundUsdTvl} = require('../helper/compound')

const unitroller_fantom = "0x892701d128d63c9856A9Eb5d967982F78FD3F2AE"
//FUSE tvl combined with fuseswap as fusefi tvl
//const unitroller_fuse = "0x26a562B713648d7F3D1E1031DCc0860A4F3Fa340"

const abis = {
    oracle: {"constant":true,"inputs":[],"name":"getRegistry","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},
    underlyingPrice: {"constant":true,"inputs":[{"internalType":"address","name":"cToken","type":"address"}],"name":"getPriceForUnderling","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},
}

module.exports={
    fantom:{
        tvl: getCompoundUsdTvl(unitroller_fantom, "fantom", "0xed8F2C964b47D4d607a429D4eeA972B186E6f111", abis)
    },
    
}