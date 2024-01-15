const { queryContract } = require("../helper/chain/cosmos");
const { getConfig } = require("../helper/cache");
const { fetchURL } = require("../helper/utils");

async function tvl(_, _1, _2, { api }) {
  const chain = api.chain;
  const contracts = await getConfig(
    "kujira/contracts",
    "https://raw.githubusercontent.com/Team-Kujira/kujira.js/master/src/resources/contracts.json"
  );
  const marketContracts = contracts["kaiyo-1"].bowMargin;
  for (const contract of marketContracts) {
    try {
      const bowContract = contract.config.bow_contract;
      const pool = await queryContract({
        contract: bowContract,
        chain,
        data: { pool: {} },
      });
      const denomString = `factory%2F${bowContract}%2Fulp`;
      const lpSupply = await fetchURL(
        `https://kujira.api.kjnodes.com/cosmos/bank/v1beta1/supply/by_denom?denom=${denomString}`
      );
      const collateralBalance = await fetchURL(
        `https://kujira.api.kjnodes.com/cosmos/bank/v1beta1/balances/${contract.address}/by_denom?denom=${denomString}`
      );
      api.add(
        contract.config.denoms[0].denom,
        (BigInt(collateralBalance.data.balance.amount) *
          BigInt(pool.balances[0])) /
          BigInt(lpSupply.data.amount.amount)
      );
      api.add(
        contract.config.denoms[1].denom,
        (BigInt(collateralBalance.data.balance.amount) *
          BigInt(pool.balances[1])) /
          BigInt(lpSupply.data.amount.amount)
      );
    } catch (error) {
      continue;
    }
  }

  return api.getBalances();
}

module.exports = {
  timetravel: false,
  kujira: { tvl },
};
