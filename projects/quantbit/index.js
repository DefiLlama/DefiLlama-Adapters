const { post } = require("../helper/http");
const { sumTokens2 } = require("../helper/unwrapLPs");

const VAULT_CONTRACT = "0xe899fD25da0e53A862CA900210a936E5Dd7Ab8FD";
const MANAGER_WALLET = "0xD968d7CEef69106Bb5Eef741373BA617fCFba96E";

const USDT = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9";
const USDC = "0xFF970A61A04b1Ca14834A43f5de4533ebDDB5CC8";
const WETH = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";
const WBTC = "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f";

const VAULT_ABI = "function getFundStatistics() view returns (uint256 totalAssets, uint256 totalShares, uint256 navPrice, uint256 depositFee, uint256 withdrawalFee, address feeCollectorAddress)";

async function getHyperliquidBalance() {
  try {
    const data = await post("https://api.hyperliquid.xyz/info", {
      type: "clearinghouseState",
      user: MANAGER_WALLET,
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

  const tokens = [USDT, USDC, WETH, WBTC];
  const balances = await Promise.all(
    tokens.map((token) =>
      api.call({
        abi: "erc20:balanceOf",
        target: token,
        params: [MANAGER_WALLET],
      })
    )
  );

  tokens.forEach((token, i) => {
    if (balances[i] && balances[i] > 0) {
      api.add(token, balances[i]);
    }
  });

  // Get full Uniswap V3 position values (including liquidity, not just fees)
  await sumTokens2({
    api,
    owners: [MANAGER_WALLET],
    resolveUniV3: true,
  });

  try {
    const hyperliquidData = await getHyperliquidBalance();
    if (hyperliquidData?.marginSummary?.accountValue) {
      const accountValue = parseFloat(hyperliquidData.marginSummary.accountValue);
      if (accountValue > 0) {
        const usdtAmount = BigInt(Math.floor(accountValue * 1000000));
        api.add(USDT, usdtAmount);
      }
    }
  } catch (error) {
    // Continue without Hyperliquid balance if there's an error
  }
}

module.exports = {
  methodology: "TVL includes: USDT balance in VaultQuoted contract, token balances (USDT, USDC, WETH, WBTC) in manager wallet, full Uniswap V3 position values (pooled assets + uncollected fees), and Hyperliquid account value.",
  arbitrum: {
    tvl,
  },
};
