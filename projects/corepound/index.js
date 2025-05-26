const { sumTokens2 } = require("../helper/unwrapLPs")

const aggregator = "0xF822226491a93046DA650ecb4049E43386497C7D";
const solvBtcMFarmAddress = "0x915Be1EC1153F3Eaef16629fE7fb532b777159AC"
const projectToken = "0x56663F56333717A32Cd91ec41182d6d76D98864e";

const abis = {
  getTotalTvl: "function getTotalTvl() view returns (tuple(uint256 pid, address assets, uint256 tvl)[])"
}

async function tvl(api) {
  const pools = (await api.multiCall({ calls: [aggregator, solvBtcMFarmAddress], abi: abis.getTotalTvl })).flat()
  pools.forEach(({ assets, tvl }) => { api.add(assets, tvl) })
  await sumTokens2({ api, resolveLP: true })
  api.removeTokenBalance(projectToken)
  }
  
  async function staking(api) {  
    const pools = await api.call({ abi: abis.getTotalTvl, target: aggregator });
    const target = pools.find((i) => i.assets === projectToken);
    api.add(projectToken, target.tvl);
    return api.getBalances();
  }
  
  module.exports = {
    core: { tvl, staking }
  };
