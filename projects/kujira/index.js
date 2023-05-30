const { sumTokens, queryContracts } = require('../helper/chain/cosmos')

const chain = "kujira";

async function tvl() {
  const uskContracts = await queryContracts({ chain, codeId: 73 });
  return sumTokens({ owners: uskContracts, chain })
}

module.exports = {
  kujira: {
    tvl,
  },
}