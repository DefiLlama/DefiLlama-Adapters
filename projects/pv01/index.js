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

  // Get total supply for each vault
  for (const vaultAddress of listOfVaults) {
    const symbol = await api.call({
      abi: 'erc20:symbol',
      target: vaultAddress
    });
    if (symbol.startsWith("rTBL")) {
      const totalSupply = await api.call({
        abi: 'erc20:totalSupply',
        target: vaultAddress
      });
      api.add(vaultAddress, totalSupply);
    }
  }
}

module.exports = {
  methodology: 'Counts the number of rTBL (Rolling T-bill) tokens issued by the PV01 perpetual bond vaults. TBL (T-bill) tokens not in a vault are not counted.',
  start: 20377028,
  ethereum: {
    tvl,
  }
};
