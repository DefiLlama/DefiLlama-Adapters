const ADDRESSES = require("../helper/coreAssets.json");

const yearnStakingDelegate = "0x05dcdBF02F29239D1f8d9797E22589A2DE1C152F";
const factory = "0x842b22Eb2A1C1c54344eDdbE6959F787c2d15844";
const veYfi = "0x90c1f9220d90d3966FbeE24045EDd73E1d588aD5";
const getAllGaugeInfoAbi = "function getAllGaugeInfo(uint256 limit, uint256 offset) view returns ((address yearnVaultAsset, address yearnVault, bool isVaultV2, address yearnGauge, address coveYearnStrategy, address autoCompoundingGauge, address nonAutoCompoundingGauge)[])"

async function tvl(api) {
  // Yearn Gauge tokens deposited in YearnStakingDelegate, receiving veYFI boost
  /** @type {{yearnVaultAsset: string, yearnVault: string, isVaultV2: boolean, yearnGauge: string, coveYearnStrategy: string, autoCompoundingGauge: string, nonAutoCompoundingGauge: string}[]} */
  const gaugeInfos = await api.call({ target: factory, abi: getAllGaugeInfoAbi, params: [100, 0] });

  await unwrapYearnGaugeToken({ api, gaugeInfos, });
  await countVeYfi(api);
}

async function unwrapYearnGaugeToken({ api, gaugeInfos }) {
  const gaugeInfoVaultsV2 = gaugeInfos.filter((i) => i.isVaultV2);
  const gaugeInfoVaultsV3 = gaugeInfos.filter((i) => !i.isVaultV2);

  const gaugeTokenBalancesV2 = await api.multiCall({
    abi: "erc20:balanceOf",
    calls: gaugeInfoVaultsV2.map((i) => ({
      target: i.yearnGauge,
      params: yearnStakingDelegate,
    })),
  });

  const gaugeTokenBalancesV3 = await api.multiCall({
    abi: "erc20:balanceOf",
    calls: gaugeInfoVaultsV3.map((i) => ({
      target: i.yearnGauge,
      params: yearnStakingDelegate,
    })),
  });
  // Assume gaugeTokenBalances is equal to vault token balance
  // If isVaultV2 is true, use `function pricePerShare() returns (uint256)` to convert vault token balance to asset balance
  // If isVaultV2 is false, use `function convertToAssets(uint256) returns (uint256)` to convert vault token balance to asset balance
  const vaultV2AssetBalances = await api.multiCall({
    abi: "function pricePerShare() returns (uint256)",
    calls: gaugeInfoVaultsV2.map((i) => ({ target: i.yearnVault })),
  })

  vaultV2AssetBalances.map((bal, i) => {
    api.add(gaugeInfoVaultsV2[i].yearnVaultAsset, gaugeTokenBalancesV2[i] * bal / 1e18)
  });
  const vaultV3AssetBalances = await api.multiCall({
    abi: "function convertToAssets(uint256) returns (uint256)",
    calls: gaugeInfoVaultsV3.map((info, i) => ({
      target: info.yearnVault,
      params: gaugeTokenBalancesV3[i]
    })),
  });
  api.add(gaugeInfoVaultsV3.map(i => i.yearnVaultAsset), vaultV3AssetBalances)
}

async function countVeYfi(api) {
  // YFI is max locked, therefore we can use the veYFI balanceOf as the YFI balance
  const veYfiBalance = await api.call({
    abi: "erc20:balanceOf",
    target: veYfi,
    params: yearnStakingDelegate,
  });
  api.addTokens(ADDRESSES.ethereum.YFI, veYfiBalance);
}

module.exports = {
  ethereum: { tvl },
};
