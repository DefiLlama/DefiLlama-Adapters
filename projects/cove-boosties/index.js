const ADDRESSES = require("../helper/coreAssets.json");

const yearnStakingDelegate = "0x05dcdBF02F29239D1f8d9797E22589A2DE1C152F";
const factory = "0x842b22Eb2A1C1c54344eDdbE6959F787c2d15844";
const veYfi = "0x90c1f9220d90d3966FbeE24045EDd73E1d588aD5";

async function tvl(api) {
  // Yearn Gauge tokens deposited in YearnStakingDelegate, receiving veYFI boost
  /** @type {{yearnVaultAsset: string, yearnVault: string, isVaultV2: boolean, yearnGauge: string, coveYearnStrategy: string, autoCompoundingGauge: string, nonAutoCompoundingGauge: string}[]} */
  const gaugeInfos = await getGaugeInfos(api);

  let balances = {};

  balances = await unwrapYearnGaugeToken({
    api,
    gaugeInfos,
  });

  balances = await countVeYfi(api);

  return balances;
}

async function unwrapYearnGaugeToken({ api, gaugeInfos }) {
  const gaugeTokenBalances = await api.multiCall({
    abi: "erc20:balanceOf",
    calls: gaugeInfos.map((i) => ({
      target: i.yearnGauge,
      params: yearnStakingDelegate,
    })),
  });
  const gaugeInfoVaultsV2 = gaugeInfos.filter((i) => i.isVaultV2);
  const gaugeInfoVaultsV3 = gaugeInfos.filter((i) => !i.isVaultV2);
  // Assume gaugeTokenBalances is equal to vault token balance
  // If isVaultV2 is true, use `function pricePerShare() returns (uint256)` to convert vault token balance to asset balance
  // If isVaultV2 is false, use `function convertToAssets(uint256) returns (uint256)` to convert vault token balance to asset balance
  const vaultV2AssetBalances = (
    await api.multiCall({
      abi: "function pricePerShare() returns (uint256)",
      calls: gaugeInfoVaultsV2.map((i) => ({ target: i.yearnVault })),
    })
  ).map((bal, i) => {
    return (
      (BigInt(
        gaugeTokenBalances[
          gaugeInfos.findIndex(
            (g) => g.yearnGauge === gaugeInfoVaultsV2[i].yearnGauge
          )
        ]
      ) *
        BigInt(bal)) /
      (10n ** 18n)
    );
  });
  const vaultV3AssetBalances = await api.multiCall({
    abi: "function convertToAssets(uint256) returns (uint256)",
    calls: gaugeInfoVaultsV3.map((info) => ({
      target: info.yearnVault,
      params:
        gaugeTokenBalances[
          gaugeInfos.findIndex((g) => g.yearnGauge === info.yearnGauge)
        ],
    })),
  });
  const assets = gaugeInfos.map((i) => i.yearnVaultAsset);
  const bals = gaugeInfos.map((i) => {
    if (i.isVaultV2) {
      return vaultV2AssetBalances[
        gaugeInfoVaultsV2.findIndex((g) => g.yearnGauge === i.yearnGauge)
      ];
    } else {
      return vaultV3AssetBalances[
        gaugeInfoVaultsV3.findIndex((g) => g.yearnGauge === i.yearnGauge)
      ];
    }
  });
  api.addTokens(assets, bals);
  return api.getBalances();
}

async function countVeYfi(api) {
  // YFI is max locked, therefore we can use the veYFI balanceOf as the YFI balance
  const veYfiBalance = await api.call({
    abi: "erc20:balanceOf",
    target: veYfi,
    params: yearnStakingDelegate,
  });
  api.addTokens(ADDRESSES.ethereum.YFI, veYfiBalance);
  return api.getBalances();
}

async function getGaugeInfos(api) {
  return (
    await api.call({
      target: factory,
      params: [100, 0],
      abi: "function getAllGaugeInfo(uint256 limit, uint256 offset) view returns ((address yearnVaultAsset, address yearnVault, bool isVaultV2, address yearnGauge, address coveYearnStrategy, address autoCompoundingGauge, address nonAutoCompoundingGauge)[])",
    })
  ).map((info) =>
    Object.keys(info).reduce((obj, key) => {
      if (isNaN(Number(key))) {
        // Check if the key is not a number
        obj[key] = info[key];
      }
      return obj;
    }, {})
  );
}

module.exports = {
  ethereum: { tvl },
};
