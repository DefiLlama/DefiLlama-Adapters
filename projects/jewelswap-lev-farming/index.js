const { sumTokens } = require("../helper/chain/elrond");

const LENDING_POOL = 'erd1qqqqqqqqqqqqqpgqhpauarfmx75nf4pwxh2fuy520ym03p8e8jcqt466up'
const LENDING_POOL_FARMS = 'erd1qqqqqqqqqqqqqpgq96n4gxvmw8nxgxud8nv8qmms5namspc5vmusg930sh'
const FARMS = 'erd1qqqqqqqqqqqqqpgqlnxy2hmvs8qxr6ezq2wmggn7ev62cjp6vmusvdral4'
const ASHSWAP_STAKE = 'erd1qqqqqqqqqqqqqpgqhw2s04kx5crn2yvx5p253aa8fmganjjqdfysjvnluz'
const LIQUID_STAKE = 'erd1qqqqqqqqqqqqqpgqx6833qjac6uqztgsa8jhlztexucke0hrdfys6wd7qt'

async function pool2() {
  const tokensAndOwners = [
    ['FARM-e5ffde-a539', FARMS],
    ['FARM-9ed1f9-2fef', FARMS],
    ['FARM-795466-60d6', FARMS],
    ['ALP-afc922', ASHSWAP_STAKE],
  ]

  return sumTokens({tokensAndOwners})
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  elrond: {
    tvl: () => sumTokens({ owners: [LENDING_POOL_FARMS, FARMS, LIQUID_STAKE]}),
    // pool2
  },
};
