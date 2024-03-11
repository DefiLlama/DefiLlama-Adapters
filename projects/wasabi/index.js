const { getLogs } = require('../helper/cache/getLogs');
const { sumERC4626VaultsExport } = require("../helper/erc4626");

const blastPools = {
  "WASABI_LONG_POOL": "0x046299143A880C4d01a318Bc6C9f2C0A5C1Ed355",
  "WASABI_SHORT_POOL": "0x0301079DaBdC9A2c70b856B2C51ACa02bAc10c3a"
};

const ethereumPools = {
  "WASABI_LONG_POOL": "0x8e0edfd6d15f858adbb41677b82ab64797d5afc0",
  "WASABI_SHORT_POOL": "0x0fdc7b5ce282763d5372a44b01db65e14830d8ff"
};

const newVaultsTopic = "0x891f008b8c9cadc4c9114ed37ce718f739b28049d58e50e35a02d94c4e9b06ff";

async function tvlBlast(_, _b, _cb, { api, }) {
  const resultVaults = [];
  for (const vaultAddress of Object.values(blastPools)) {
    const logs = await getLogs({
      api,
      target: vaultAddress,
      topics: [newVaultsTopic],
      eventAbi: 'event NewVault(address pool, address indexed asset, address vault)',
      onlyArgs: true,
      fromBlock: 185200,
    });
    resultVaults.push(...logs.map(log => log.vault));
  }
  return sumERC4626VaultsExport({ vaults: resultVaults, tokenAbi: 'asset', balanceAbi: 'totalAssets'});
}

async function tvlEth(_, _b, _cb, { api, }) {
  const resultVaults = [];
  for (const vaultAddress of Object.values(ethereumPools)) {
    const logs = await getLogs({
      api,
      target: vaultAddress,
      topics: [newVaultsTopic],
      eventAbi: 'event NewVault(address pool, address indexed asset, address vault)',
      onlyArgs: true,
      fromBlock: 18810700,
    });
    resultVaults.push(...logs.map(log => log.vault));
  }
  return sumERC4626VaultsExport({ vaults: resultVaults, tokenAbi: 'asset', balanceAbi: 'totalAssets'});
}

module.exports = {
  ethereum: {
    tvl: tvlEth
  },
  blast: {
    tvl: tvlBlast
  }
};
