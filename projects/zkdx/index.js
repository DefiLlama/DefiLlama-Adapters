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

    }
};
