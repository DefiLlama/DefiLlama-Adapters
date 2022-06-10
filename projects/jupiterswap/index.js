const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
    misrepresentedTokens: true,
    methodology: "Factory addresses (0x4FD2c40c25Dd40e9Bf0CE8479bA384178b8671b5 for kava) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
    kava: {
        tvl: getUniTVL({
            factory: '0xc08BAEA14C14f25bcafe3e3E05550715505eF3dE',
            chain: 'kava',
            coreAssets: [
                '0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b'
            ]
        }),
    }
}
