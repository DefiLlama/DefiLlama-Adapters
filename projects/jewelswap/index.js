const { toUSDTBalances } = require("../helper/balances");
const { sumTokens } = require("../helper/chain/elrond");
const { get } = require("../helper/http");
const { sumTokensExport } = require("../helper/chain/cardano");
const { getPrices } = require("../algofi/utils");
const sdk = require('@defillama/sdk')
const ADDRESSES = require("../helper/coreAssets.json");

const API_URL = "https://api-nfts.jewelswap.io/tvl";

async function tvlWithAPI() {
  const data = await get(API_URL);
  return toUSDTBalances(data);
}

const LENDING_POOL = 'erd1qqqqqqqqqqqqqpgqhpauarfmx75nf4pwxh2fuy520ym03p8e8jcqt466up'
const LENDING_POOL_FARMS = 'erd1qqqqqqqqqqqqqpgq96n4gxvmw8nxgxud8nv8qmms5namspc5vmusg930sh'
const FARMS = 'erd1qqqqqqqqqqqqqpgqlnxy2hmvs8qxr6ezq2wmggn7ev62cjp6vmusvdral4'
const ASHSWAP_STAKE = 'erd1qqqqqqqqqqqqqpgqhw2s04kx5crn2yvx5p253aa8fmganjjqdfysjvnluz'
const LIQUID_STAKE = 'erd1qqqqqqqqqqqqqpgqx6833qjac6uqztgsa8jhlztexucke0hrdfys6wd7qt'

async function computeTvl(tokensAndOwners) {
  const prices = await getPrices()
  const balances = await sumTokens({ chain: 'elrond', tokensAndOwners, })
  Object.entries(prices).forEach(([token, price]) => {
    if (!balances[token]) return;
    sdk.util.sumSingleBalance(balances, 'tether', balances[token] * price)
    delete balances[token]
  })
  return balances
}

async function pool2() {
  const tokensAndOwners = [
    ['FARM-e5ffde-a539', FARMS],
    ['FARM-9ed1f9-2fef', FARMS],
    ['FARM-795466-60d6', FARMS],
    ['ALP-afc922', ASHSWAP_STAKE],
  ]

  return computeTvl(tokensAndOwners)
}

async function tvl() {
  const tokensAndOwners = [
    [ADDRESSES.null, LENDING_POOL],
    [ADDRESSES.null, LENDING_POOL_FARMS],
    [ADDRESSES.null, FARMS],
    [ADDRESSES.null, ASHSWAP_STAKE],
    [ADDRESSES.null, LIQUID_STAKE]
  ]
  return computeTvl(tokensAndOwners)
}


module.exports = {
  timetravel: false,
  elrond: {
    tvl,
    pool2
  },
};
