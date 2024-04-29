const ADDRESSES = require('../helper/coreAssets.json')
const {staking} = require("../helper/staking");

module.exports = {
    methodology: 'zkDX counts the staking values as tvl',
    start: 3744214,
    era: {
        tvl: staking(
            ["0x79033C597B7d8e752a7511cF24512f4A7217C0B8", "0xd6cce119B45Efcb378a4735a96aE08826A37ca1c",
            "0xDC9e925D2BB683d47203eCEddBD1d733EC035CaE","0xA9C595C8F718898f7eb96964Bc92517365c901C9"],
            [ADDRESSES.era.WETH, ADDRESSES.era.USDC]
        )

    },
    linea: {
        tvl: staking(
          ["0x3e636c4dC9Bd55831055c3400160e1e8A25DaD8a", "0xE0D1977a23cb90252B9997aB07b03136E214E0C6",
              "0x3a85b87e81cD99D4A6670f95A4F0dEdAaC207Da0"],
          [ADDRESSES.linea.WETH, ADDRESSES.linea.USDC]
        )
    },
    zklink:{
        tvl: staking(["0xb5e635f2cB9eAC385D679069f8e0d1740436b355", "0xa6DbD1bdB1DC4339Df51d90Ce306CCE6edFbbbb1"],
            ["0x0000000000000000000000000000000000000000", "0x1a1A3b2ff016332e866787B311fcB63928464509"])
    }
};
