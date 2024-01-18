
const { getConfig } = require("../helper/cache");
const { queryContract } = require("../helper/chain/cosmos");

async function tvl(_, _1, _2, { api }) {
  const chain = api.chain;
  const contracts = await getConfig("kujira/contracts", "https://raw.githubusercontent.com/Team-Kujira/kujira.js/master/src/resources/contracts.json");
  const bowPools = contracts["kaiyo-1"].bow;
  for (const contract of bowPools) {
    try {
      const pool = await queryContract({
        contract: contract.address,
        chain,
        data: { pool: {} },
      });

      api.add(contract.config.denoms[0], pool.balances[0])
      api.add(contract.config.denoms[1], pool.balances[1])
    } catch (error) {
      continue;
    }
  }

  return api.getBalances();
}

module.exports = {
  doublecounted: false,
  kujira: {
    tvl,
  },
}