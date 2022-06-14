const { tombTvl } = require("../helper/tomb");

const chains = [
    {
        chain: "fantom",
        token: "0x112df7e3b4b7ab424f07319d4e92f41e6608c48b",
        share: "0x8a41f13a4fae75ca88b1ee726ee9d52b148b0498",
        rewardPool: "0xa058316Af6275137B3450C9C9A4022dE6482BaC2",
        masonry: "0x704115B8200392f2855B400bf0E414F3C8c3A472",
        pool2: [
            "0x9ce8e9b090e8af873e793e0b78c484076f8ceece",
            "0x2dc234dbfc085ddbc36a6eacc061d7333cd397b0"
        ]
    },
    {
        chain: "avax",
        token: "0x6ca558bd3eaB53DA1B25aB97916dd14bf6CFEe4E",
        share: "0x9466Ab927611725B9AF76b9F31B2F879Ff14233d",
        rewardPool: "0xb5cc0Ed74dde9F26fBfFCe08FF78227F4Fa86029",
        masonry: "0xf5e49b0a960459799F1E9b3f313dFA81D2CE553c",
        pool2: [
            "0x1179E6AF2794fA9d39316951e868772F96230375",
            "0x6139361Ccd4f40abF3d5D22AA3b72A195010F9AB"
        ]
    },
    {
        chain: "bsc",
        token: "0xA2315cC5A1e4aE3D0a491ED4Fe45EBF8356fEaC7",
        share: "0x6c7fc3Fd4a9f1Cfa2a69B83F92b9DA7EC26240A2",
        rewardPool: "0x18A5aefA5a6B20FeEeF0a3AabF876c813b04dB3d",
        masonry: "0x9Fb5Ee9D3ACebCCa39F69d6A2aa60fd8eAfA88B6",
        pool2: [
            "0xC7DC9343C90Be0Ea2af6776EFe5e19B2734F8D0d",
            "0x8eA4875469e8Fd7ad3790b4c7DEeF768ca1e806f"
        ]
    },
    {
        chain: "polygon",
        token: "0xA0dF47432d9d88bcc040E9ee66dDC7E17A882715",
        share: "0x8063037ea50E4a066bF1430EA1E3e609CD5cEf6B",
        rewardPool: "0xa4dC4c7624acE1b415e6D937E694047b517F2D99",
        masonry: "0x4f1437a43500B7863c614528e6A15b220904010B",
        pool2: [
            "0x05eFa0Ed56DDdB4E950E3F5a54e349A137d4edC9",
            "0x07D53b147eF96FAD1896D1156755A9Da7E06098E"
        ]
    }
];

module.exports = {
    misrepresentedTokens: true,
    ...chains
      .map(c =>
        tombTvl(c.token, c.share, c.rewardPool, c.masonry, c.pool2, c.chain, undefined, false, c.pool2[1])
      )
      .reduce((prev, curr) => ({ ...prev, ...curr }), {})
};
