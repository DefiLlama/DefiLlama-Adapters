const { unwrap4626Tokens } = require("../helper/unwrapLPs");

const yearnStakingDelegate = "0x05dcdBF02F29239D1f8d9797E22589A2DE1C152F";
const factory = "0x842b22Eb2A1C1c54344eDdbE6959F787c2d15844";
const veYfi = "0x90c1f9220d90d3966FbeE24045EDd73E1d588aD5";

async function tvl(api) {
  // Yearn Gauge tokens deposited in YearnStakingDelegate, receiving veYFI boost
  /** @type {{yearnVaultAsset: string, yearnVault: string, isVaultV2: boolean, yearnGauge: string, coveYearnStrategy: string, autoCompoundingGauge: string, nonAutoCompoundingGauge: string}[]} */
  const gaugeInfos = (
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

  const balances = await unwrap4626Tokens({
    api,
    tokensAndOwners: gaugeInfos.map((i) => [
      i.yearnGauge,
      yearnStakingDelegate,
    ]),
  });

  return balances;
}

module.exports = {
  ethereum: { tvl },
};
