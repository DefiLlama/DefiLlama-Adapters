const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')
const { get } = require('../helper/http');

const milkywayDelegationAddress = "celestia1vxzram63f7mvseufc83fs0gnt5383lvrle3qpt"
const celestiaCoinGeckoId = "celestia";

async function tvl() {
  const balances = {}
  
  // get the total amount staked on chain by milkyway
  const delegationAmounts = await get("https://celestia-api.polkachu.com/cosmos/staking/v1beta1/delegations/" + milkywayDelegationAddress);
  let totalDelegated = 0;
  delegationAmounts.delegation_responses.forEach(response => {
    totalDelegated += parseInt(response.balance.amount) / 1e6;
  });

  sdk.util.sumSingleBalance(balances, celestiaCoinGeckoId, totalDelegated)
  return balances
}
module.exports = {
  timetravel: false,
  methodology: 'TVL counts the TVL of the Milky Way liquid staking protocol',
  osmosis: {
    tvl,
  },
}; // node test.js projects/milky-way/index.js
