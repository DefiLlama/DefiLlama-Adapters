const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
    misrepresentedTokens: true,
    methodology: "Factory addresses (0x8F1fD6Ed57B0806FF114135F5b50B5f76e9542F2 for kava) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
    kava: {
        tvl: getUniTVL({
            factory: '0x8F1fD6Ed57B0806FF114135F5b50B5f76e9542F2',
            chain: 'kava',
            coreAssets: [
                '0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b',
                "0xfA9343C3897324496A05fC75abeD6bAC29f8A40f",
                "0xB44a9B6905aF7c801311e8F4E76932ee959c663C",
                "0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b",
                "0x765277EebeCA2e31912C9946eAe1021199B39C61",
                "0x7C598c96D02398d89FbCb9d41Eab3DF0C16F227D",
                "0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d",
            ]
        }),
    }
}
