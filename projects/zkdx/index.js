const sdk = require("@defillama/sdk");
const ADDRESSES = require('../helper/coreAssets.json')
const {staking} = require("../helper/staking");
const {gmxExports} = require("../helper/gmx");

module.exports = {
    timetravel: false,
    misrepresentedTokens: false,
    methodology: 'zkDX counts the vault and staking values as tvl',
    start: 3744214,
    era: {
        tvl: sdk.util.sumChainTvls(
            [
                gmxExports({vault: "0x6a29d14176248E84760473d28973F53821fB6287"}),
                staking(
                    ["0x79033C597B7d8e752a7511cF24512f4A7217C0B8", "0xd6cce119B45Efcb378a4735a96aE08826A37ca1c"],
                    [ADDRESSES.era.WETH, ADDRESSES.era.USDC]
                )
            ]
        )
    }
};
