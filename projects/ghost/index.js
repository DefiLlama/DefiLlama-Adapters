const {
  queryContracts,
  queryContract,
} = require("../helper/chain/cosmos");

async function tvl(_, _1, _2, { api }) {
  const chain = api.chain
  const contracts = await queryContracts({ chain, codeId: 106 });
  const deposited = (await Promise.all(
    contracts.map(contract => queryContract({ contract, chain, data: { status: {} } }))
  )).map(i => i.deposited)
  const tokens = (await Promise.all(
    contracts.map(contract => queryContract({ contract, chain, data: { config: {} } }))
  )).map(i => i.denom)
  api.addTokens(tokens, deposited)
}

module.exports = {
  timetravel: false,
  kujira: {
    tvl,
  },
};
