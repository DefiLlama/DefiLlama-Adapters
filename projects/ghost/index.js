const {
  queryContracts,
  queryContract,
} = require("../helper/chain/cosmos");

async function tvl(_, _1, _2, { api }) {
  const chain = api.chain
  const vaultContracts = await queryContracts({ chain, codeId: 106 });
  const marketContracts = await queryContracts({ chain, codeId: 113 });
  for (const contract of vaultContracts) {
    const { deposited, borrowed } = await queryContract({ contract, chain, data: { status: {}  } })
    const { denom } = await queryContract({ contract, chain, data: { config: {}  } })
    api.add(denom, deposited - borrowed)
  }

  for (const contract of marketContracts) {
    const { deposited } = await queryContract({ contract, chain, data: { status: {}  } })
    const { collateral_denom } = await queryContract({ contract, chain, data: { config: {}  } })
    api.add(collateral_denom, deposited)
  }
}

async function borrowed(_, _1, _2, { api }) {
  const chain = api.chain
  const vaultContracts = await queryContracts({ chain, codeId: 106 });
  for (const contract of vaultContracts) {
    const { borrowed } = await queryContract({ contract, chain, data: { status: {}  } })
    const { denom } = await queryContract({ contract, chain, data: { config: {}  } })
    api.add(denom, borrowed)
  }
}

module.exports = {
  timetravel: false,
  kujira: {
    tvl,
    borrowed,
  },
};
