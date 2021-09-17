const sdk = require("@defillama/sdk");
const utils = require("../helper/utils");
const { toUSDTBalances } = require("../helper/balances");

const API_URL = "https://chart.ptokens.io/index.php?a=assets";

async function calcTvl(CHAIN) {
  let totalLiquidityUSD = 0;

  (await utils.fetchURL(API_URL)).data
    .filter((chain) => chain.hostBlockchain.includes(CHAIN))
    .map((tvl) => tvl.tvl_number)
    .forEach(function (sup) {
      totalLiquidityUSD += sup;
    });

  return toUSDTBalances(totalLiquidityUSD);
}

const ethTvl = async () => {
  return await calcTvl("eth");
};

const bscTvl = async () => {
  return await calcTvl("bsc");
};

const eosTvl = async () => {
  return await calcTvl("eos");
};

const ultraTvl = async () => {
  return await calcTvl("ultra");
};

const telosTvl = async () => {
  return await calcTvl("telos");
};

const polygonTvl = async () => {
  return await calcTvl("polygon");
};

const xdaiTvl = async () => {
  return await calcTvl("xdai");
};

module.exports = {
  ethereum: {
    tvl: ethTvl,
  },
  binance: {
    tvl: bscTvl,
  },
  eosio: {
    tvl: eosTvl,
  },
  ultra: {
    tvl: ultraTvl,
  },
  telos: {
    tvl: telosTvl,
  },
  polygon: {
    tvl: polygonTvl,
  },
  xdai: {
    tvl: xdaiTvl,
  },
  tvl: sdk.util.sumChainTvls([
    ethTvl,
    bscTvl,
    eosTvl,
    ultraTvl,
    telosTvl,
    polygonTvl,
    xdaiTvl,
  ]),
  methodology:
    "We count the liquidity of all Supported Assets on sevaral chains. Metrics come from https://ptokens.io/",
};
