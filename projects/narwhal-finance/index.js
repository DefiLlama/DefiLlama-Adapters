const coreAssets = require('../helper/coreAssets.json');
const { sumTokens2 } = require('../helper/unwrapLPs');

const tokens = {
  arbitrum: {
    USDT: coreAssets.arbitrum.USDT,
  },
  bsc: {
    USDT: coreAssets.bsc.USDT,
  },
};

const narwhal = {
  arbitrum: {
    NarwhalTradingVault: '0x14559479DC1041Ef6565f44028D454F423d2b9E6',
  },
  bsc: {
    NarwhalTradingVault: '0x71AF984f825C7BEf79cAEE5De14565ca8A29Fe93',
  },
};

async function arbTvl() {
  const tokensAndOwners = [
    [tokens.arbitrum.USDT, narwhal.arbitrum.NarwhalTradingVault],
  ];
  return sumTokens2({ chain: "arbitrum", tokensAndOwners });
}

async function bscTvl() {
  const tokensAndOwners = [
    [tokens.bsc.USDT, narwhal.bsc.NarwhalTradingVault],
  ];
  return sumTokens2({ chain: "bsc", tokensAndOwners });
}

module.exports = {
  hallmarks: [
    [1689034511, "Launch on Arbitrum & BSC"],
  ],
  arbitrum: {
    tvl: arbTvl,
  },
  bsc: {
    tvl: bscTvl,
  },
};
