const { sumTokens2 } = require('../helper/unwrapLPs');
const defaultAddresses = require('./berachain-contracts.json')

async function getContracts() {
    const contracts = await fetch('https://api.beracana.com/beracana/getContracts2');
    const resp = await contracts.json();
    if (resp.success && resp.data && resp.data.vaults){
      return { vaults: resp.data.vaults }
    } else {
      return { vaults: defaultAddresses.vaults }
    }
}
async function getTvl(api) {
    const { vaults } = await getContracts();
    const vaultAddresses = vaults.map(i => i.vaultAddress)
    const vaultFunds = await api.multiCall({  abi: 'function totalFunds() view returns (uint256)', calls: vaultAddresses })
    const vaultTokens = vaults.map(i => i.priceToken)
    api.add(vaultTokens, vaultFunds)
    return sumTokens2({ api, resolveLP: false})
}

module.exports = {
  berachain:{
    tvl: getTvl
  }
};
