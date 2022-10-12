const { ethers, BigNumber } = require("ethers");
const methodology = "";
const useStrategyMetadata = require("./StrategyMetadata").useStrategyMetadata;
const useLegacyIsolatedStrategyMetadata =
  require("./StrategyMetadata").useLegacyIsolatedStrategyMetadata;
const getTokenDecimalsAndValue1e18 =
  require("./tokens").getTokenDecimalsAndValue1e18;
const useParsedStakingMetadata =
  require("./StakingMetadata").useParsedStakingMetadata;

async function tvl(timestamp, block) {
  const allStratMeta = await useStrategyMetadata(block);
  const legacyStratMeta = await useLegacyIsolatedStrategyMetadata(block);
  const { tokenDecimals, tokenValuePer1e18 } =
    await getTokenDecimalsAndValue1e18([...allStratMeta, ...legacyStratMeta]);

  const stakeMeta = await useParsedStakingMetadata();

  const tvlsFarm = stakeMeta
    .filter((x) => x)
    .filter(([x]) => x)
    .reduce((tvl, row) => {
      return tvl.add(row.tvl);
    }, BigNumber.from(0));

  const tvlNoFarm = Object.values(allStratMeta)
    .map((row) => {
      let decimals = tokenDecimals[row.token];
      let valuePer1e18 = tokenValuePer1e18[row.token];
      const trueOne = ethers.utils.parseUnits("1", decimals);

      const valPerOne = trueOne
        .mul(valuePer1e18)
        .div(ethers.utils.parseEther("1"));
      return {
        ...row,
        tvlInPeg: BigNumber.from(row.tvl).mul(valPerOne).div(trueOne),
      };
    })
    .reduce(
      (tvl, row) => BigNumber.from(tvl).add(row.tvlInPeg),
      BigNumber.from(0)
    );

  const legacyTvlNoFarm = Object.values(legacyStratMeta)
    .map((row) => {
      let decimals = tokenDecimals[row.token];
      let valuePer1e18 = tokenValuePer1e18[row.token];
      const trueOne = ethers.utils.parseUnits("1", decimals);
      const valPerOne = trueOne
        .mul(valuePer1e18)
        .div(ethers.utils.parseEther("1"));
      return {
        ...row,
        tvlInPeg: BigNumber.from(row.tvl).mul(valPerOne).div(trueOne),
      };
    })
    .reduce(
      (tvl, row) => BigNumber.from(tvl).add(row.tvlInPeg),
      BigNumber.from(0)
    );
  const tvl = tvlNoFarm.add(tvlsFarm).add(legacyTvlNoFarm);

  return {
    "avax:0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E": parseFloat(
      ethers.utils.formatUnits(tvl, 12)
    ),
  };
}

module.exports = {
  methodology: methodology,
  avax: {
    tvl,
  },
};
