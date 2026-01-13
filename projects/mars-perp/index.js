const { queryContract } = require('../helper/chain/cosmos');

const contractAddresses = {
  neutron: {
    perps: 'neutron1g3catxyv0fk8zzsra2mjc0v4s69a7xygdjt85t54l7ym3gv0un4q2xhaf6'
  },
};

async function tvl(api) {
  const chain = api.chain;
  const { perps } = contractAddresses[chain];
  const info = await queryContract({ contract: perps, chain, data: { 'config': {} }, });
  const perpsVault = await queryContract({ contract: perps, chain, data: { 'vault': {} }, });

  if (perpsVault) api.add(info.base_denom, perpsVault['total_withdrawal_balance']);
}

module.exports = {
  timetravel: false,
  methodology:
    "For each chain, sum token balances by querying the total deposit amount for each asset in the chain's params contract.",
  neutron: { tvl },
}
