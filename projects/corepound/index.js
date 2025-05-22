const { sumTokens2 } = require("../helper/unwrapLPs")

const aggregator = "0xF822226491a93046DA650ecb4049E43386497C7D";
const solvBtcMFarmAddress = "0x915Be1EC1153F3Eaef16629fE7fb532b777159AC"
const projectToken = "0x56663F56333717A32Cd91ec41182d6d76D98864e";

async function tvl(api) {
    let pools = await api.call({ abi: abiInfo.pools, target: aggregator });
  
    pools
      .forEach((i) => {
        api.add(i.assets, i.tvl);
      });

    pools = await api.call({ abi: abiInfo.pools, target: solvBtcMFarmAddress });
  
    pools
      .forEach((i) => {
        api.add(i.assets, i.tvl);
      });
  
    return await sumTokens2({ api, resolveLP: true });
  }
  
  async function staking(api) {  
    let pools = await api.call({ abi: abiInfo.pools, target: aggregator });
    let target = pools.find((i) => i.assets === projectToken);
    api.add(projectToken, target.tvl);
    return api.getBalances();
  }
  
  module.exports = {
    core:{
      tvl,
      staking
    }
  };
  
  const abiInfo = {
    pools:
      "function getTotalTvl() view returns (tuple(uint256 pid, address assets, uint256 tvl)[])",
  };
  