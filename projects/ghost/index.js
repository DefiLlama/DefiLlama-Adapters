const { queryContract } = require("../helper/chain/cosmos");
const { getConfig } = require("../helper/cache");

async function tvl(api) {
  const chain = api.chain
  const contracts = await getConfig("kujira/contracts", "https://raw.githubusercontent.com/Team-Kujira/kujira.js/master/src/resources/contracts.json");
  const vaultContracts = contracts["kaiyo-1"].ghostVault;
  const marketContracts = contracts["kaiyo-1"].ghostMarket;
  for (const contract of vaultContracts) {
    const { deposited, borrowed } = await queryContract({ contract: contract.address, chain, data: { status: {}  } })
    api.add(contract.config.denom, deposited - borrowed)
  }

  for (const contract of marketContracts) {
    const { deposited } = await queryContract({ contract: contract.address, chain, data: { status: {}  } })
    api.add(contract.config.collateral_denom, deposited)
  }
  return api.getBalances()
}

async function borrowed(api) {
  const contracts = await getConfig("kujira/contracts", "https://raw.githubusercontent.com/Team-Kujira/kujira.js/master/src/resources/contracts.json");
  const vaultContracts = contracts["kaiyo-1"].ghostVault;
  const chain = api.chain
  for (const contract of vaultContracts) {
    const { borrowed } = await queryContract({ contract: contract.address, chain, data: { status: {}  } })
    api.add(contract.config.denom, borrowed)
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
