const { queryContract } = require('../helper/chain/cosmos');

const controlCenterContract = 'neutron1d054u05vx29k20gqrj5h2h2lz7pl7x9fch4ypl5jmaj6q5yw4vgsgk4lx0';
const base_denom = 'ibc/B559A80D62249C8AA07A380E2A2BEA6E5CA9A6F079C912C3A9E9B494105E4F81';

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
  methodology: "Query Hydro Inflow USD Vault total pool value to get the TVL.",
  neutron: {tvl},
  hallmarks: [],
};
