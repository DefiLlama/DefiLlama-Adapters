const ADDRESSES = require('../helper/coreAssets.json');
const { post } = require("../helper/http");
const { sumTokensExport } = require("../helper/unwrapLPs");

const VAULT_MANAGER_ADDRESS = "0xaFE480f375EBd13dF703ef50b429357d29D162Ee";
const TRADING_WALLETS = ["0xf2460F28C9BaCB35Ac6feF048b661d33Ad070Aaf"];

async function fetchWalletEquity(walletAddress) {
  const walletPortfolio = await post("https://api.hyperliquid.xyz/info", {
    type: "portfolio",
    user: walletAddress,
  });
  const period = walletPortfolio.find(([name]) => name === "day") ?? walletPortfolio[0];
  const accountValueHistory = period?.[1]?.accountValueHistory;
  const latestSnapshot = accountValueHistory?.[accountValueHistory.length - 1];
  const equity = Number(latestSnapshot?.[1]);
  if (!Number.isFinite(equity))
    throw new Error(`Unexpected Hyperliquid portfolio response for ${walletAddress}: ${JSON.stringify(walletPortfolio).slice(0, 300)}`);
  return equity;
}

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
    vaultInfos.push(...vaults.filter(v => v && v.vaultAddress !== ADDRESSES.null));
    if (vaults.some(v => !v || v.vaultAddress === ADDRESSES.null)) break;
    index += BATCH;
  }

  if (vaultInfos.length === 0) return;

  const now = api.timestamp;

  const preDepositCloseVaults = [];
  const tradingVaults = [];
  const withdrawalVaults = [];

  vaultInfos.forEach(vault => {
    if (now < vault.depositCloseAt) {
      preDepositCloseVaults.push(vault);
    } else if (now < vault.withdrawOpenAt) {
      tradingVaults.push(vault);
    } else {
      withdrawalVaults.push(vault);
    }
  });

  // Before deposits close, TVL equals the share token total supply, since shares are minted 1:1 with asset-token.
  if (preDepositCloseVaults.length > 0) {
    const supplies = await api.multiCall({
      abi: 'erc20:totalSupply',
      calls: preDepositCloseVaults.map(v => v.shareToken)
    });
    preDepositCloseVaults.forEach((vault, i) => {
      api.add(vault.assetToken, supplies[i]);
    });
  }

  // During the trading period, assets sit in the vaults' trading wallets, not the vault contract.
  // Read live equity (including unrealized PnL) for every trading wallet and sum it into TVL.
  if (tradingVaults.length > 0) {
    const equities = await Promise.all(
      TRADING_WALLETS.map(wallet => fetchWalletEquity(wallet))
    );
    const totalEquity = equities.reduce((sum, equity) => sum + equity, 0);
    api.addCGToken('usd-coin', totalEquity);
  }

  // Once the withdrawal period opens, funds have been settled back to the vault contract,
  // so TVL equals the actual asset-token balance held, including realized trading PnL.
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
  methodology: "TVL is the sum of all vaults, each valued based on its lifecycle stage. Before deposits close, shares are minted 1:1 with asset-token, the supply represents committed capital. During the trading period, assets sit in the vault's trading wallet. Once the withdrawal period opens, it equals the actual asset token balance held by the vault contract, including realized trading PnL."
};
