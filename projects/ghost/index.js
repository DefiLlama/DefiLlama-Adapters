const {
  queryContracts,
  queryContract,
} = require("../helper/chain/cosmos");

async function tvl(_, _1, _2, { api }) {
  const chain = api.chain
  const vaultContracts = await queryContracts({ chain, codeId: 106 });
  const vaultDeposited = (await Promise.all(
    vaultContracts.map(contract => queryContract({ contract, chain, data: { status: {} } }))
  )).map(i => i.deposited)
  const vaultTokens = (await Promise.all(
    vaultContracts.map(contract => queryContract({ contract, chain, data: { config: {} } }))
  )).map(i => i.denom)
  api.addTokens(vaultTokens, vaultDeposited)

  const marketContracts = await queryContracts({ chain, codeId: 113 });
  const marketDeposited = (await Promise.all(
    marketContracts.map(contract => queryContract({ contract, chain, data: { status: {} } }))
  )).map(i => i.deposited)
  const marketTokens = (await Promise.all(
    marketContracts.map(contract => queryContract({ contract, chain, data: { config: {} } }))
  )).map(i => i.collateral_denom)
  api.addTokens(marketTokens, marketDeposited)
}

module.exports = {
  timetravel: false,
  kujira: {
    tvl,
  },
};
