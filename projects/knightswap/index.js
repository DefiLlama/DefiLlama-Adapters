const { calculateUniTvl } = require("../helper/calculateUniTvl");
const { stakingUnknownPricedLP } = require("../helper/staking");

const bscFactory = "0xf0bc2E21a76513aa7CC2730C7A1D6deE0790751f";
const ftmFactory = "0x7d82F56ea0820A9d42b01C3C28F1997721732218";

const bscStaking = "0xE50cb76A71b0c52Ab091860cD61b9BA2FA407414";
const bscKnight = "0xd23811058eb6e7967d9a00dc3886e75610c4abba";
const knightBusdLP = "0xA12e1e2E2dea79694448aB9ef63bd4D82a26d90c";

const ftmStaking = "0xb02e3A4B5ebC315137753e24b6Eb6aEF7D602E40";
const ftmKnight = "0x6cc0e0aedbbd3c35283e38668d959f6eb3034856";
const knightUsdcLP = "0x68D47D67b893c44A72BCAC39b1b658D4Cbdf87CA";

const translateTokens = {
  "0x049d68029688eabf473097a2fc38ef61633a3c7a":
    "0xdac17f958d2ee523a2206206994597c13d831ec7", // fUSDT to USDT
  "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e":
    "0x6b175474e89094c44da98b954eedeac495271d0f", // DAI
};

async function bscTvl(timestamp, block, chainBlocks) {
  return await calculateUniTvl(
    (addr) => `bsc:${addr}`,
    chainBlocks.bsc,
    "bsc",
    bscFactory,
    0,
    true
  );
}

async function ftmTvl(timestamp, block, chainBlocks) {
  return await calculateUniTvl(
    (addr) => {
      addr = addr.toLowerCase();
      if (translateTokens[addr] !== undefined) {
        return translateTokens[addr];
      }
      return `fantom:${addr}`;
    },
    chainBlocks.fantom,
    "fantom",
    ftmFactory,
    0,
    true
  );
}

module.exports = {
  methodology: "TVL consists of pools created by the factory contract",
  bsc: {
    tvl: bscTvl,
    staking: stakingUnknownPricedLP(
      bscStaking,
      bscKnight,
      "bsc",
      knightBusdLP,
      (addr) => `bsc:${addr}`
    ),
  },
  fantom: {
    tvl: ftmTvl,
    staking: stakingUnknownPricedLP(
      ftmStaking,
      ftmKnight,
      "fantom",
      knightUsdcLP,
      (addr) => `fantom:${addr}`
    ),
  },
};
