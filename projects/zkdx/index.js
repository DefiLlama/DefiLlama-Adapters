const ADDRESSES = require('../helper/coreAssets.json')
const {staking} = require("../helper/staking");

module.exports = {
    timetravel: false,
    misrepresentedTokens: false,
    methodology: 'zkDX counts the staking values as tvl',
    start: 3744214,
    era: {
        tvl: staking(
            ["0x79033C597B7d8e752a7511cF24512f4A7217C0B8", "0xd6cce119B45Efcb378a4735a96aE08826A37ca1c"],
            [ADDRESSES.era.WETH, ADDRESSES.era.USDC]
        )

    }
};
