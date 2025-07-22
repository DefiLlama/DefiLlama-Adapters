const { printerTvl } = require("./helper");

const chains = [
    {
        chain: "fantom",
        token: "0xea97c7c1c89d4084e0BFB88284FA90243779da9f",
        share: "0xFFAbb85ADb5c25D57343547a8b32B62f03814B12",
        rewardPool: "0xF95AB2A261B0920f3d5aBc02A41dBe125eBA10aE",
        masonry: "0xb1E6B2a4e6c5717CDBf8F6b01e89455C920a3646",
        pool2: [
            "0x5BfFC514670263c4c0858B00E4618c729fef6c59",
            "0xDECC75dBF9679d7A3B6AD011A98F05b5CC6A8a9d",
            "0xa09697EbE1C5B1c8021dc8B3b38c528efE019b29"
        ]
    },
    {
        chain: "bsc",
        token: "0xE239b561369aeF79eD55DFdDed84848A3bF60480",
        share: "0xc08Aa06C1D707BF910ADA0BdEEF1353F379E64e1",
        rewardPool: "0xf4B0Fd23af6FC66886EA59A5007500a27eaEC0bB",
        masonry: "0xC46e07BBA17Bc36F1529321d076B3B3c50b4a4B5",
        pool2: [
            "0xa5c4953c64e943071ef8545c092ccb4fb3c0269f",
            "0xafa3e7f9d489d022f3d91902fb9540bab0af52c1",
            "0x8F7c61b3FA9c18c711a42e2219B4cA6C67C47aDa"
        ]
    },
    {
        chain: "avax",
        token: "0x1affBc17938a25d245e1B7eC6f2fc949df8E9760",
        share: "0x32975907733f93305be28e2bfd123666b7a9c863",
        rewardPool: "0x8593875bc450ebE8e9D6fDA5298E44273fB7EA0a",
        masonry: "0x3A6750d2b5c14456A06D9742EB34Fc920700688C",
        pool2: [
            "0x77435089521e3b05217dbAA461a7722DfE9bDB5D",
            "0x960a262de5ac9545391503c133bf1b069614a01f",
            "0x16c57fb970dd46c96491cb462647da423040c899"
        ]
    },
    {
        chain: "cronos",
        token: "0x1affBc17938a25d245e1B7eC6f2fc949df8E9760",
        share: "0x32975907733f93305BE28E2bfd123666b7A9c863",
        rewardPool: "0x8593875bc450ebE8e9D6fDA5298E44273fB7EA0a",
        masonry: "0x3A6750d2b5c14456A06D9742EB34Fc920700688C",
        pool2: [
            "0xD60a097b8D5DC1caAF84b7f825f6516Ac5734D70",
            "0x4330e62B3da05B6C41cf9F38B3d3A603840eB485",
            "0xF1Ea7cEA3CD8849e6D4880f25767df40460F2235"
        ]
    },
    {
        chain: "polygon",
        token: "0x11a1779ae6b02bb8E7ff847919bcA3e55BcbB3D5",
        share: "0x0731D0C0D123382C163AAe78A09390cAd2FFC941",
        rewardPool: "0x4C25fFcbAC4BB1a01FB25A73d5eca02b98753d08",
        masonry: "0x3a0f2A0Eba2069F7F15df9B92F954c14a08A0c59",
        pool2: [
            "0x29689Ab7fc5438C5039864339f2A4F28E25f1aE5",
            "0x3ff9352415999a9270d5AA80A77E675C4b0A2CB4",
            "0x90139ccdfe463a85cfD34823465227f78C280cea"
        ]
    },
    {
        chain: "harmony",
        token: "0x1affBc17938a25d245e1B7eC6f2fc949df8E9760",
        share: "0x32975907733f93305be28e2bfd123666b7a9c863",
        rewardPool: "0x8593875bc450ebE8e9D6fDA5298E44273fB7EA0a",
        masonry: "0x3A6750d2b5c14456A06D9742EB34Fc920700688C",
        pool2: [
            "0x15a977844a276ca6d381e3a607418cc8944a2f04",
            "0x1bE7E6D9d048b0aEF3d174646b839D0B254FaaB8",
            "0xe527aa3f3ce67a35a217625a40fd90081c48f79b"
        ]
    }   
];

module.exports = {
        misrepresentedTokens: true,
    ...chains
      .map(c =>
        printerTvl(c.token, c.share, c.rewardPool, c.masonry, c.pool2, c.chain, undefined, false, c.pool2[1])
      )
      .reduce((prev, curr) => ({ ...prev, ...curr }), {})
};
