const { post } = require("../helper/http");
const { sumTokens2 } = require("../helper/unwrapLPs");

const VAULT_CONTRACT = "0xe899fD25da0e53A862CA900210a936E5Dd7Ab8FD";

// All wallets are equal — each is checked for: token balances, Uniswap V3 positions, Revert Finance equity, Hyperliquid. Add more addresses as needed.
const WALLETS = [
  "0xD968d7CEef69106Bb5Eef741373BA617fCFba96E",
  "0xD2ba23d5657e51C91f8399c57DF2aB3DC3c3B7BE",
];

const USDT = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9";
const USDC = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831"; // Native USDC on Arbitrum
const USDC_E = "0xFF970A61A04b1Ca14834A43f5de4533ebDDB5CC8"; // Bridged USDC.e (if needed)
const WETH = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";
const WBTC = "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f";

const VAULT_ABI = "function getFundStatistics() view returns (uint256 totalAssets, uint256 totalShares, uint256 navPrice, uint256 depositFee, uint256 withdrawalFee, address feeCollectorAddress)";

// Revert Lend V3Vault on Arbitrum — https://docs.revert.finance/revert/resources/contract-addresses
const REVERT_V3_VAULT = "0x74e6afef5705beb126c6d3bf46f8fad8f3e07825";
const REVERT_VAULT_ABI = {
  loanCount: "function loanCount(address owner) view returns (uint256)",
  loanAtIndex: "function loanAtIndex(address owner, uint256 index) view returns (uint256)",
  loanInfo:
    "function loanInfo(uint256 tokenId) view returns (uint256 debt, uint256 fullValue, uint256 collateralValue, uint256 liquidationCost, uint256 liquidationValue)",
  asset: "function asset() view returns (address)",
};

async function getRevertPositionEquity(api) {
  let totalEquity = 0n;
  for (const owner of WALLETS) {
    try {
      const count = await api.call({
        abi: REVERT_VAULT_ABI.loanCount,
        target: REVERT_V3_VAULT,
        params: [owner],
      });
      const n = Number(count ?? 0);
      if (n <= 0) continue;
      const tokenIds = await api.multiCall({
        abi: REVERT_VAULT_ABI.loanAtIndex,
        target: REVERT_V3_VAULT,
        calls: Array.from({ length: n }, (_, i) => ({ params: [owner, i] })),
      });
      const validIds = tokenIds.filter((id) => id != null && id !== undefined);
      if (validIds.length === 0) continue;
      const infos = await api.multiCall({
        abi: REVERT_VAULT_ABI.loanInfo,
        target: REVERT_V3_VAULT,
        calls: validIds.map((id) => ({ params: [id] })),
      });
      for (const info of infos) {
        if (info == null) continue;
        // loanInfo returns (debt, fullValue, collateralValue, liquidationCost, liquidationValue) — SDK may return object or array
        const debt = BigInt(info.debt ?? info[0] ?? 0);
        const fullValue = BigInt(info.fullValue ?? info[1] ?? 0);
        if (fullValue > debt) {
          totalEquity += fullValue - debt;
        }
      }
    } catch (e) {
      // skip if Revert vault call fails
    }
  }
  return totalEquity;
}

async function getHyperliquidBalance(user) {
  try {
    const data = await post("https://api.hyperliquid.xyz/info", {
      type: "clearinghouseState",
      user,
    });
    return data;
  } catch (error) {
    return { marginSummary: { accountValue: "0" } };
  }
}

async function tvl(api) {
  const vaultStats = await api.call({
    abi: VAULT_ABI,
    target: VAULT_CONTRACT,
  });

  if (vaultStats && vaultStats.totalAssets) {
    api.add(USDT, vaultStats.totalAssets);
  }

  // Token balances for all wallets
  const tokens = [USDT, USDC, USDC_E, WETH, WBTC];
  for (const owner of WALLETS) {
    const balances = await Promise.all(
      tokens.map((token) =>
        api.call({
          abi: "erc20:balanceOf",
          target: token,
          params: [owner],
        })
      )
    );
    for (let i = 0; i < tokens.length; i++) {
      if (balances[i] && BigInt(balances[i]) > 0n) {
        api.add(tokens[i], balances[i]);
      }
    }
  }

  // Full Uniswap V3 position values for all wallets (positions held directly in wallet)
  await sumTokens2({
    api,
    owners: WALLETS,
    resolveUniV3: true,
  });

  // Revert Finance: positions held as collateral in V3Vault — add equity (fullValue - debt) in vault asset (USDC)
  try {
    const [revertEquity, revertAsset] = await Promise.all([
      getRevertPositionEquity(api),
      api.call({ abi: REVERT_VAULT_ABI.asset, target: REVERT_V3_VAULT }).catch(() => USDC),
    ]);
    if (revertEquity > 0n && revertAsset) {
      api.add(revertAsset, revertEquity);
    }
  } catch (e) {
    // skip if Revert vault fails
  }

  // Hyperliquid account value for all wallets
  try {
    for (const user of WALLETS) {
      const hyperliquidData = await getHyperliquidBalance(user);
      if (hyperliquidData?.marginSummary?.accountValue) {
        const accountValueStr = String(hyperliquidData.marginSummary.accountValue);
        const [whole, frac = ""] = accountValueStr.split(".");
        if (/^\d+$/.test(whole)) {
          const fracPadded = (frac + "000000").slice(0, 6);
          const usdtAmount = BigInt(whole) * 1_000_000n + BigInt(fracPadded);
          if (usdtAmount > 0n) {
            api.add(USDT, usdtAmount);
          }
        }
      }
    }
  } catch (error) {
    // Continue without Hyperliquid balance if there's an error
  }
}

module.exports = {
  methodology: "TVL includes: USDT in VaultQuoted contract; for each wallet in WALLETS: token balances (USDT, USDC, USDC.e, WETH, WBTC), full Uniswap V3 positions in wallet, Revert Finance position equity (collateral minus borrowed USDC), Hyperliquid account value.",
  arbitrum: {
    tvl,
  },
};
