const { sumERC4626VaultsExport } = require("../helper/erc4626");
const sdk = require('@defillama/sdk');

const registryAddresses = {
  berachain: ['0x34C83440fF0b21a7DaD14c22fB7B1Bb3fc8433E6'],
  ethereum: ['0x0Ed9E3271B7bD5a94E95d5c36d87321372B2FA14'],
  morph: ['0x04c60a0468BC0d329A0C04e8391699c41D95D981'],
  corn: ['0xed497422Eb43d309D63bee71741FF17511bAb577']
}

async function getVaultAddresses(chain) {
  const vaults = [];
  for (const registry of registryAddresses[chain]) {
    const vaults1 = await sdk.api.abi.call({
      target: registry,
      abi: 'function getAllVaults() view returns (address[])',
      params: [],
      chain,
    })
    vaults1.output.forEach(vault => vaults.push(vault))
  }
  return vaults;
}

module.exports = {
  methodology: "TVL includes all deposits made to the protocols vaults.",
};

Object.keys(registryAddresses).forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => {
      const vaults = await getVaultAddresses(chain)
      return sumERC4626VaultsExport({ vaults, isOG4626: true })(api)
    }
  }
})