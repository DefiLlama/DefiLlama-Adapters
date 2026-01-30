const { queryContract } = require('../helper/chain/cosmos');

const controlCenterContract = 'neutron1vk3cy35cudlpk8w9kuu9prcanc49n3ajcnu86a43ue9ln6v4v6zsaucnw9';
const base_denom = 'ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9';

async function tvl(api) {
  const chain = api.chain;

  const poolInfo = await queryContract({
      contract: controlCenterContract,
      chain,
      data: { 'pool_info': {} },
    });

    api.add(base_denom, poolInfo.total_pool_value);
}

module.exports = {
  timetravel: false,
  methodology: "Query Hydro Inflow ATOM Vault total pool value to get the TVL.",
  neutron: {tvl},
  hallmarks: [],
};
