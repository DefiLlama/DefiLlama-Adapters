const {
  sumTokens,
  queryContracts,
  queryContract,
} = require("../helper/chain/cosmos");

const chain = "kujira";

async function tvl() {
  const contracts = await queryContracts({ chain, codeId: 106 });
  const deposits = await Promise.all(
    contracts.map((contract) =>
      Promise.all([
        queryContract({ contract, chain, data: { status: {} } }),
        queryContract({ contract, chain, data: { config: {} } }),
      ])
    )
  );

  const balances = deposits.reduce(
    (agg, [{ deposited }, { denom }]) => ({
      ...agg,
      [denom]: deposited,
    }),
    {}
  );

  return sumTokens({ owners: contracts, balances, chain });
}

module.exports = {
  timetravel: false,
  kujira: {
    tvl,
  },
};
