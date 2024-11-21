const PV01_VAULT_FACTORY_ETHEREUM = '0x7eB37F9326E2474D5178Fd5224bc35E30A5398B5';
const abi = {
  getVaults: "function getVaults(string type_) view returns (address[])"
};

async function tvl(api) {
  // Fetch the list of vaults from the factory
  const listOfVaults = await api.call({
    abi: abi.getVaults,
    target: PV01_VAULT_FACTORY_ETHEREUM,
    params: ['BondPerpetualVault']
  });
  if (!listOfVaults || listOfVaults.length === 0) {
    return;
  }

  // Fetch total supply for each vault
  const totalSupplies = await api.multiCall({
    abi: "erc20:totalSupply",
    calls: listOfVaults,
  });
  
  listOfVaults.forEach((vaultAddress, index) => {
    api.add(vaultAddress, totalSupplies[index]);
  });
}

module.exports = {
  methodology:
    "Counts the total supply of rTBL (Rolling T-bill) tokens across all PV01 perpetual bond vaults.",
  start: 20377028,
  ethereum: {
    tvl,
  },
};
