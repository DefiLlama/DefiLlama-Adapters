const {
  queryContracts,
  queryContract,
} = require("../helper/chain/cosmos");
const { getConfig } = require("../helper/cache");

async function tvl(_, _1, _2, { api }) {
  const chain = api.chain
  const contracts = await getConfig("kujira/contracts", "https://raw.githubusercontent.com/Team-Kujira/kujira.js/master/src/resources/contracts.json");
  const vaultContracts = contracts["kaiyo-1"].ghostVault.map(x => x.address)
  const marketContracts = contracts["kaiyo-1"].ghostMarket.map(x => x.address)
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
  return api.getBalances()
}

async function borrowed(_, _1, _2, { api }) {
  const chain = api.chain
  const vaultContracts = await queryContracts({ chain, codeId: 106 });
  for (const contract of vaultContracts) {
    const { borrowed } = await queryContract({ contract, chain, data: { status: {}  } })
    const { denom } = await queryContract({ contract, chain, data: { config: {}  } })
    api.add(denom, borrowed)
  }
  return api.getBalances()
}

module.exports = {
  timetravel: false,
  kujira: {
    tvl,
    borrowed,
  },
};
