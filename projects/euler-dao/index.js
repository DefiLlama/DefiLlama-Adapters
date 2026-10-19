const { getCuratorExport } = require("../helper/curators");

// EulerDAO sunset dao managed vaults, and handed them off to AlphaGrowth 
// (projects/alpha-growth/index.js) and K3 (projects/k3/index.js)
// https://forum.euler.finance/t/sunsetting-of-dao-managed-market-and-vaults/1828
const SUNSET = '2026-05-06';
const SUNSET_TS = Math.floor(new Date(SUNSET).getTime() / 1000);

const configs = {
  methodology: `Count all assets deposited in vaults curated by Euler DAO. Sunset May 2026, vaults are now curated by AlphaGrowth and K3.`,
  blockchains: {
    ethereum: {
      eulerVaultOwners: [
        '0xEe009FAF00CF54C1B4387829aF7A8Dc5f0c8C8C5',
        '0x95058F3d4C69F14f6125ad4602E925845BD5d6A4',
      ],
    },
    base: {
      eulerVaultOwners: [
        '0x8359062798F09E277ABc6EB7D51652289176D2e9',
        '0x95058F3d4C69F14f6125ad4602E925845BD5d6A4',
      ],
    },
    unichain: {
      eulerVaultOwners: [
        '0x3566a8b300606516De2E4576eC4132a0E13f9f66',
      ],
    },
    swellchain: {
      eulerVaultOwners: [
        '0xC798cA555e4C7e6Fa04A23e1a727c12884F40B69',
      ],
    },
    linea: {
      eulerVaultOwners: [
        '0x624DC899774EEf1cD9c17ED10d19c9483Fa9eb0A',
      ],
    },
    arbitrum: {
      eulerVaultOwners: [
        '0xAeE4e2E8024C1B58f4686d1CB1646a6d5755F05C',
      ],
    },
    monad: {
      eulerVaultOwners: [
        // '0x5D42F8aCd567810D57D60f90bB9C6d194207a6e1',  // operated by k3 now: https://forum.euler.finance/t/sunsetting-of-dao-managed-market-and-vaults/1828
      ],
    }
  }
}

const adapter = getCuratorExport(configs);

// Pre-sunset queries return historical TVL; post-sunset returns $0.
for (const chain of Object.keys(configs.blockchains)) {
  const original = adapter[chain].tvl;
  adapter[chain].tvl = async (api) =>
    api.timestamp && api.timestamp >= SUNSET_TS ? {} : original(api);
}

adapter.hallmarks = [[SUNSET, "Sunset vaults"]];
module.exports = adapter;
