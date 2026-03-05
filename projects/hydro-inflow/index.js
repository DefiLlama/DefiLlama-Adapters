const { queryContract } = require('../helper/chain/cosmos');

const contracts = [
  // ATOM vault
  {
    controlCenterContract: 'neutron1vk3cy35cudlpk8w9kuu9prcanc49n3ajcnu86a43ue9ln6v4v6zsaucnw9',
    base_denom: 'ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9',
  },
  // BTC vault
  {
    controlCenterContract: 'neutron1c3djqnwur4aryxe7knr4kvcm3hj2wvnl5887lc5dwsh7z40pf2cq9flznr',
    base_denom: 'ibc/0E293A7622DC9A6439DB60E6D234B5AF446962E27CA3AB44D0590603DFF6968E',
  },
  // USDC vault
  {
    controlCenterContract: 'neutron1d054u05vx29k20gqrj5h2h2lz7pl7x9fch4ypl5jmaj6q5yw4vgsgk4lx0',
    base_denom: 'ibc/B559A80D62249C8AA07A380E2A2BEA6E5CA9A6F079C912C3A9E9B494105E4F81',
  },
];

async function tvl(api) {
  const chain = api.chain;

  for (const contract of contracts) {
    const poolInfo = await queryContract({
      contract: contract.controlCenterContract,
      chain,
      data: { 'pool_info': {} },
    });

    api.add(contract.base_denom, poolInfo.total_pool_value);
  }
}

module.exports = {
  timetravel: false,
  methodology: "For each Hydro Inflow vault, query the total pool value and sum them up to get the TVL.",
  neutron: {tvl},
  hallmarks: [],
};
