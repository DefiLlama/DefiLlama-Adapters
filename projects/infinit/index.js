const { sumTokensExport } = require("../helper/unwrapLPs");

const VAULT_MANAGER_ADDRESS = "0xaFE480f375EBd13dF703ef50b429357d29D162Ee";

async function tvl(api) {
  const vaultInfos = [];
  const BATCH = 10;
  let index = 1;

  while (true) {
    const vaults = await api.multiCall({
      target: VAULT_MANAGER_ADDRESS,
      abi: 'function vaults(uint256) view returns (tuple(address shareToken, address assetToken, address vaultAddress, string name, uint256 depositOpenAt, uint256 depositCloseAt, uint256 withdrawOpenAt))',
      calls: Array.from({ length: BATCH }, (_, i) => index + i),
      permitFailure: true,
    });
    vaultInfos.push(...vaults.filter(v => v && v.vaultAddress !== '0x0000000000000000000000000000000000000000'));
    if (vaults.some(v => !v || v.vaultAddress === '0x0000000000000000000000000000000000000000')) break;
    index += BATCH;
  }

  if (vaultInfos.length === 0) return;

  const now = api.timestamp;

  const preWithdrawalVaults = [];
  const withdrawalVaults = [];

  vaultInfos.forEach(vault => {
    if (now < vault.withdrawOpenAt) {
      preWithdrawalVaults.push(vault);
    } else {
      withdrawalVaults.push(vault);
    }
  });

  // Before the withdrawal period opens, it equals the share token totalSupply. Shares are minted 1:1 with asset-token deposits, so the supply represents committed capital(during trading, assets sit in Hyperliquid/DEX trading wallets).
  // Once the withdrawal period opens, it equals the actual asset-token balance held by the vault contract, including trading PnL.

  if (preWithdrawalVaults.length > 0) {
    const supplies = await api.multiCall({
      abi: 'erc20:totalSupply',
      calls: preWithdrawalVaults.map(v => v.shareToken)
    });
    preWithdrawalVaults.forEach((vault, i) => {
      api.add(vault.assetToken, supplies[i]);
    });
  }

  if (withdrawalVaults.length > 0) {
    const balances = await api.multiCall({
      abi: 'erc20:balanceOf',
      calls: withdrawalVaults.map(v => ({
        target: v.assetToken,
        params: [v.vaultAddress]
      }))
    });
    withdrawalVaults.forEach((vault, i) => {
      api.add(vault.assetToken, balances[i]);
    });
  }
}

module.exports = {
  arbitrum: {
    tvl,
  },
  bsc: {
    staking: sumTokensExport({ "owners": ["0xc8e6c14ccebed218a64df570025c5a1eeb0cdadc"], "tokens": ["0x61fac5f038515572d6f42d4bcb6b581642753d50"] }),
  },
  methodology: "TVL is calculated per vault based on its lifecycle stage. Before the withdrawal period opens, it equals the share token totalSupply. Shares are minted 1:1 with asset-token deposits, so the supply represents committed capital (during trading, assets sit in Hyperliquid/DEX trading wallets). Once the withdrawal period opens, it equals the actual asset-token balance held by the vault contract, including trading PnL."
};
