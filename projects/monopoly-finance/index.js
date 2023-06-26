const { staking } = require("../helper/staking");
const abi = require("./abi.json");
const { unwrapLPsAuto } = require("../helper/unwrapLPs");
const chef = "0x2900f5E68cD57b712806f60096514A4D3F772E9D";
const poly = "0x34772C4D12F288368Aa35AE7bc527A6B2b3e8906".toLowerCase();
const ACC_POLY_PRECISION = 1e18;

async function getTokensInMasterChef(time, ethBlock, chainBlocks, { api }) {
  const poolInfo = await api.fetchList({
    lengthAbi: abi.poolLength,
    itemAbi: abi.poolInfo,
    target: chef,
  });

  poolInfo.forEach((pool) => {
    let { lpToken, totalShares, lpPerShare } = pool;
    lpToken = lpToken.toLowerCase();
    if (lpToken === poly) {
      return;
    }
    let bals = (totalShares * lpPerShare) / ACC_POLY_PRECISION;
    api.add(lpToken, bals);
  });
  await unwrapLPsAuto({
    api,
    lpAddresses: poolInfo.map((p) => p.lpToken),
    block: chainBlocks["arbitrum"],
  });
}
module.exports = {
  methodology:
    "TVL includes all farms in MasterChef contract, as well as staking pools.",
  arbitrum: {
    tvl: getTokensInMasterChef,
    staking: staking("0xF30489AdB76745BFb201023403B5E1bCcb216354", poly),
  },
};
