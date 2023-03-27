const { getUniTVL } = require('../helper/unknownTokens')
const { stakingPricedLP } = require("../helper/staking");

const IFS = "0x6925435f9D1CB710abeb680Ec7EF3f8C5E1B2639";
const FACTORY = "0x44b7864D360BFf7879402E3B860aF47e6e371208";
const MASTERCHEF = "0xB9C8c5Bf667310a33D4CB675e2f20c7542d8B3B3";
const IFS_USDT_LP = "0x72083c2de1b53a09ea9ed4a99c63749102ba9aaf";
const COREASSETNAME = "tether";
const CHAIN = "csc";

const ifswapDexTvl = getUniTVL({ factory: FACTORY, chain: CHAIN, useDefaultCoreAssets: true, })

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "We count liquidity of all paris through Factory Contract and Pools (single tokens) seccions through MasterChef Contract.",
  csc: {
    tvl: ifswapDexTvl,
    staking: stakingPricedLP(
      MASTERCHEF,
      IFS,
      "csc",
      IFS_USDT_LP,
      COREASSETNAME
    ),
  },
};
