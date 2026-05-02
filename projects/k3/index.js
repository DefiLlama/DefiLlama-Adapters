const { ABI } = require("../helper/curators/configs");
const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology:
    "Count all assets are deposited in all vaults curated by K3 Capital.",
  blockchains: {
    ethereum: {
      symbiotic: ["0xdC47953c816531a8CA9E1D461AB53687d48EEA26"],
      eulerVaultOwners: ["0xdD84A24eeddE63F10Ec3e928f1c8302A47538b6B"],
      morphoVaultOwners: ["0xdD84A24eeddE63F10Ec3e928f1c8302A47538b6B"],
      mellow: [
        "0xc65433845ecD16688eda196497FA9130d6C47Bd8",
        "0x82f5104b23FF2FA54C2345F821dAc9369e9E0B26",
      ],
      erc4626: [
        "0x50bd66d59911f5e086ec87ae43c811e0d059dd11",
        "0xf5503d3d4bd254c2c17690eed523bcb2935db6de",
        "0x866C6c6627303Be103814150fC0e886BE5D9ea83",
        "0xe1B4d34E8754600962Cd944B535180Bd758E6c2e",
        "0x3b3bDAA4462851621818D2CEBC835E077587147A",
      ],
    },
    bsc: {
      eulerVaultOwners: [
        "0x5Bb012482Fa43c44a29168C6393657130FDF0506",
        "0x2E28c94eE56Ac6d82600070300d86b3a14D5d71A",
      ],
    },
    avax: {
      eulerVaultOwners: [
        "0xa4dC6C20475fDD05b248fbE51F572bD3154dd03B",
        "0xdD84A24eeddE63F10Ec3e928f1c8302A47538b6B",
      ],
      erc4626: ["0x8fc260cd0a00cac30eb1f444b8f1511d71420af9"],
    },
    bob: {
      eulerVaultOwners: ["0xDb81B93068B886172988A1A4Dd5A1523958a23f0"],
    },
    unichain: {
      morphoVaultOwners: ["0xe34A3fb26B3121F4E68bE89Ea553BaC2149F975d"],
    },
    plasma: {
      eulerVaultOwners: ["0x060DB084bF41872861f175d83f3cb1B5566dfEA3"],
      erc4626: [
        "0x539b2ee4f3a04f33d53c0813f77e65148963f72b",
        "0xAADEA03f6D6F198Bdc9229bD8113aceD19031773",
        "0x767d33217e7d2670695FfE2a104548B780f4F5d8",
        "0x141A6f77ca186861BFB323b07012e80Ef4e09041",
        "0x2F33b4AE409e86c6BEa9E2Bbe98361c19F2A1f0c",
        "0x9d86B4fc23D8438fC4Aba58642DC35D5F64fE941",
        "0xDa33Ba72A303C26515edE275a2521b469F97D71b",
        "0xFE8d21E64e0c6CFb9abF224e805452acdE8e91Fa",
        "0xfc5c4e5593A352CEDc9E5D7fD4e21b321140c345",
      ],
    },
    arbitrum: {
      eulerVaultOwners: ["0xAeE4e2E8024C1B58f4686d1CB1646a6d5755F05C"],
    },
  },
};

const adapter = getCuratorExport(configs);

/**
 * Adds TVL for an ERC4626-like vault that doesn't implement totalAssets().
 * Assumes the vault still exposes `asset()` (standard ERC4626).
 */
async function addCustom4626Tvl(api, vaultAddress) {
  // 1) Resolve underlying asset token
  const asset = await api.call({
    target: vaultAddress,
    abi: ABI.ERC4626.asset,
    permitFailure: true,
  });

  if (!asset) return;

  // 2) Read total assets using the first ABI that works
  const total = await api.call({
    target: vaultAddress,
    abi: "uint256:getTotalAssets",
    permitFailure: true,
  });

  if (total == null) return;

  // 3) Add to balances
  api.add(asset, total);
}

// ----------------- override tvl -----------------

const prevEthTvl = adapter.ethereum.tvl;

adapter.ethereum.tvl = async (api) => {
  // run normal curator aggregation first
  await prevEthTvl(api);

  // then add your custom vault
  await addCustom4626Tvl(api, "0xAEEb2fB279a5aA837367B9D2582F898a63b06ca1");
  await addCustom4626Tvl(api, "0x0243755a22E37b835486fdAE9A839523ADABd336");
};

module.exports = adapter;