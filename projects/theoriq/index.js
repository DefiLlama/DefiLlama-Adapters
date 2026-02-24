const ADDRESSES = require("../helper/coreAssets.json");

const VAULT = "0xDbC81B33A23375A90c8Ba4039d5738CB6f56fE8d";
const ETH_SENTINEL = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

// Spark Protocol supply/debt tokens (leveraged wstETH/WETH strategy)
const SPARK_SP_WSTETH = "0x12b54025c112aa61face2cdb7118740875a566e9";
const SPARK_DEBT_WETH = "0x2e7576042566f8d6990e07a1b61ad1efd86ae70d";

// Aave V3 supply/debt tokens (wstETH/sUSDe/USDe strategy)
const AAVE_A_WSTETH = "0x0B925eD163218f6662a35e0f0371Ac234f9E9371";
const AAVE_A_SUSDE = "0x4579a27af00a62c0eb156349f31b345c08386419";
const AAVE_DEBT_USDE = "0x015396e1f286289ae23a762088e863b3ec465145";

// Lido Withdrawal Queue (for pending ETH withdrawal NFTs)
const LIDO_WITHDRAWAL_QUEUE = "0x889edC2eDab5f40e902b864aD4d7AdE8E412F9B1";

async function tvl(api) {
  // --- 1. Discover vault assets dynamically ---
  const assetCount = await api.call({
    abi: "uint256:getAssetCount",
    target: VAULT,
  });
  const indices = Array.from({ length: assetCount }, (_, i) => i);
  const rawAssets = await api.multiCall({
    abi: "function assetAt(uint256) view returns (address)",
    target: VAULT,
    calls: indices,
  });
  // The vault uses 0xEeee...EeE for native ETH; the SDK expects the null address
  const tokens = rawAssets.map((a) =>
    a.toLowerCase() === ETH_SENTINEL ? ADDRESSES.null : a
  );

  // --- 2. Discover subvaults dynamically ---
  const subvaultCount = await api.call({
    abi: "uint256:subvaults",
    target: VAULT,
  });
  const svIndices = Array.from({ length: subvaultCount }, (_, i) => i);
  const subvaultAddrs = await api.multiCall({
    abi: "function subvaultAt(uint256) view returns (address)",
    target: VAULT,
    calls: svIndices,
  });

  // --- 3. Sum idle asset balances (ETH, WETH, wstETH) across vault + subvaults ---
  const owners = [VAULT, ...subvaultAddrs];
  await api.sumTokens({ owners, tokens });

  // --- 4. Spark Protocol positions on subvaults ---
  // Supply: spWstETH → count as wstETH
  const spWstBals = await api.multiCall({
    abi: "erc20:balanceOf",
    target: SPARK_SP_WSTETH,
    calls: subvaultAddrs,
  });
  spWstBals.forEach((bal) => api.add(ADDRESSES.ethereum.WSTETH, bal));

  // Debt: variableDebtWETH → subtract
  const spDebtBals = await api.multiCall({
    abi: "erc20:balanceOf",
    target: SPARK_DEBT_WETH,
    calls: subvaultAddrs,
  });
  spDebtBals.forEach((bal) => api.add(ADDRESSES.ethereum.WETH, "-" + bal));

  // --- 5. Aave V3 positions on subvaults ---
  // Supply: aEthwstETH → count as wstETH
  const aaveWstBals = await api.multiCall({
    abi: "erc20:balanceOf",
    target: AAVE_A_WSTETH,
    calls: subvaultAddrs,
  });
  aaveWstBals.forEach((bal) => api.add(ADDRESSES.ethereum.WSTETH, bal));

  // Supply: aEthsUSDe → count as sUSDe
  const aaveSusdeBals = await api.multiCall({
    abi: "erc20:balanceOf",
    target: AAVE_A_SUSDE,
    calls: subvaultAddrs,
  });
  aaveSusdeBals.forEach((bal) => api.add(ADDRESSES.ethereum.sUSDe, bal));

  // Debt: variableDebtEthUSDe → subtract
  const aaveUsdeBals = await api.multiCall({
    abi: "erc20:balanceOf",
    target: AAVE_DEBT_USDE,
    calls: subvaultAddrs,
  });
  aaveUsdeBals.forEach((bal) => api.add(ADDRESSES.ethereum.USDe, "-" + bal));

  // --- 6. Lido withdrawal NFTs on subvaults → count pending stETH as ETH ---
  for (const sv of subvaultAddrs) {
    const requestIds = await api.call({
      abi: "function getWithdrawalRequests(address) view returns (uint256[])",
      target: LIDO_WITHDRAWAL_QUEUE,
      params: [sv],
    });
    if (requestIds.length === 0) continue;
    const statuses = await api.call({
      abi: "function getWithdrawalStatus(uint256[]) view returns ((uint256 amountOfStETH, uint256 amountOfShares, address owner, uint256 timestamp, bool isFinalized, bool isClaimed)[])",
      target: LIDO_WITHDRAWAL_QUEUE,
      params: [requestIds],
    });
    for (const s of statuses) {
      if (!s.isClaimed) api.add(ADDRESSES.null, s.amountOfStETH);
    }
  }
}

module.exports = {
  doublecounted: true,
  methodology:
    "TVL is the net asset value of the Theoriq vault: idle assets plus Spark and Aave lending positions minus borrowed debt, plus pending Lido withdrawal NFTs.",
  ethereum: { tvl },
};
