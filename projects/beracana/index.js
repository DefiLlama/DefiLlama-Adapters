const { sumTokens2 } = require('../helper/unwrapLPs');
const defaultAddresses = require('./berachain-contracts.json')

async function getContracts() {
    const contracts = await fetch('https://api.beracana.com/beracana/getContracts');
    const resp = await contracts.json();
    if (resp.success && resp.data && resp.data.banks && resp.data.vaults){
      return { banks: resp.data.banks, vaults: resp.data.vaults }
    } else {
      return { banks: defaultAddresses.banks, vaults: defaultAddresses.vaults }
    }
}
async function getTvl(api) {
    const { banks, vaults } = await getContracts();
    const tokens = banks.map(i => i.token)
    const bankAddresses = banks.map(i => i.bank)
    const currentFunds = await api.multiCall({  abi: 'function currentFunds() view returns (uint256)', calls: bankAddresses })
    const vaultAddresses = vaults.map(i => i.vaultAddress)
    const vaultFunds = await api.multiCall({  abi: 'function totalFunds() view returns (uint256)', calls: vaultAddresses })
    const vaultTokens = vaults.map(i => i.priceToken)
    api.add(tokens, currentFunds)
    api.add(vaultTokens, vaultFunds)
    return sumTokens2({ api, resolveLP: false})
}

module.exports = {
  berachain:{
    tvl: getTvl
  }
};
