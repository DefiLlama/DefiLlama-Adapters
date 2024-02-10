const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')
const { get } = require('../helper/http');

const milkTiaCoinGeckoId = "milkyway-staked-tia";
const milkTiaDenom = "factory/osmo1f5vfcph2dvfeqcqkhetwv75fda69z7e5c2dldm3kvgj23crkv6wqcn47a0/umilkTIA";

async function tvl() {
  const balances = {}
  
  const assetAmount = await get("https://osmosis-api.polkachu.com/cosmos/bank/v1beta1/supply/by_denom?denom=" + milkTiaDenom);
  const amount = parseInt(assetAmount.amount.amount) / 1e6;
  sdk.util.sumSingleBalance(balances, milkTiaCoinGeckoId, amount)
  return balances
}
module.exports = {
  timetravel: false,
  methodology: 'TVL counts the TVL of the Milky Way liquid staking protocol',
  osmosis: {
    tvl,
  },
}; // node test.js projects/milky-way/index.js
