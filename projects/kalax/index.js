const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs");

const KALAX = "0x2F67F59b3629Bf24962290DB9edE0CD4127e606D";

async function tvl(api) {
  const FARM = "0xE63153C3360aCa0F4e7Ca7A1FC61c2215FAEF5A1";

  let pools = await api.call({ abi: abiInfo.poolInfos, target: FARM });
  pools
    .filter((i) => i.assets !== KALAX)
    .forEach((i) => {
      if (i.assets === ADDRESSES.linea.WETH_1) {
        i.assets = ADDRESSES.null;
      }
      api.add(i.assets, i.tvl);
    });
  return await sumTokens2({ api, resolveLP: true });
}

async function staking(api) {
  const FARM = "0xE63153C3360aCa0F4e7Ca7A1FC61c2215FAEF5A1";

  let pools = await api.call({ abi: abiInfo.poolInfos, target: FARM });
  let target = pools.find((i) => i.assets === KALAX);

  api.add(target.assets, target.tvl);
  return api.getBalances();
}

module.exports = {
  blast: {
    tvl,
    staking,
  },
};

const abiInfo = {
  poolInfos:
    "function getPoolTotalTvl() view returns (tuple(uint256 pid, address assets, uint256 tvl)[])",
};
