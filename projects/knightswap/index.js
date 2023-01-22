const { uniTvlExport } = require("../helper/calculateUniTvl");
const { stakingUnknownPricedLP } = require("../helper/staking");

const bscFactory = "0xf0bc2E21a76513aa7CC2730C7A1D6deE0790751f";
const ftmFactory = "0x7d82F56ea0820A9d42b01C3C28F1997721732218";

const bscStaking = "0xE50cb76A71b0c52Ab091860cD61b9BA2FA407414";
const bscKnight = "0xd23811058eb6e7967d9a00dc3886e75610c4abba";
const knightBusdLP = "0xA12e1e2E2dea79694448aB9ef63bd4D82a26d90c";

const ftmStaking = "0xb02e3A4B5ebC315137753e24b6Eb6aEF7D602E40";
const ftmKnight = "0x6cc0e0aedbbd3c35283e38668d959f6eb3034856";
const knightUsdcLP = "0x68D47D67b893c44A72BCAC39b1b658D4Cbdf87CA";

module.exports = {
  methodology: "TVL consists of pools created by the factory contract",
  bsc: {
    tvl: uniTvlExport(bscFactory, 'bsc'),
    staking: stakingUnknownPricedLP(
      bscStaking,
      bscKnight,
      "bsc",
      knightBusdLP,
      (addr) => `bsc:${addr}`
    ),
  },
  fantom: {
    tvl: uniTvlExport(ftmFactory, 'fantom'),
    staking: stakingUnknownPricedLP(
      ftmStaking,
      ftmKnight,
      "fantom",
      knightUsdcLP,
      (addr) => `fantom:${addr}`
    ),
  },
};
