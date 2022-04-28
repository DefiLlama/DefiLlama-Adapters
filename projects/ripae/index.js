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
