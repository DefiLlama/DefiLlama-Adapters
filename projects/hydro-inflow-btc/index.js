const { queryContract } = require('../helper/chain/cosmos');

const controlCenterContract = 'neutron1c3djqnwur4aryxe7knr4kvcm3hj2wvnl5887lc5dwsh7z40pf2cq9flznr';
const base_denom = 'ibc/0E293A7622DC9A6439DB60E6D234B5AF446962E27CA3AB44D0590603DFF6968E';

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
  methodology: "Query Hydro Inflow BTC Vault total pool value to get the TVL.",
  neutron: {tvl},
  hallmarks: [],
};
