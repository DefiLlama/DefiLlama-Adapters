const { sumTokens2 } = require("../helper/unwrapLPs")

const aggregator = "0xF822226491a93046DA650ecb4049E43386497C7D";
const solvBtcMFarmAddress = "0x915Be1EC1153F3Eaef16629fE7fb532b777159AC"
const solvBtcCoreFarmAddress = "0x6b0365A2217A5Ad90bF220e1Cd4F62d29736ED1D"
const coreDaoFarmAddress = "0x6A76Bc0830Ed39763f2b3d79105A763243d7b310"
const wbtcFarmAddress = "0xC4f303eA6e29eB25Df1e09DF687C91E48376ABeE"
const coreDaoFarmAddress2 = "0x63aD89C392b69ba92C0d36741d030d039Ed5DB16"
const solvBtcBFarmAddress = "0xc2039CD91B597ECe076EF6d4f205B874983B0256"
const ahmFarmAddress1 = "0x82Addbf89c790009BaE95B5234A4DE2A88179AFb"
const projectToken = "0x56663F56333717A32Cd91ec41182d6d76D98864e";

const abis = {
  getTotalTvl: "function getTotalTvl() view returns (tuple(uint256 pid, address assets, uint256 tvl)[])"
}

async function tvl(api) {
  const pools = (await api.multiCall({ calls: [aggregator, solvBtcMFarmAddress, solvBtcCoreFarmAddress,coreDaoFarmAddress,wbtcFarmAddress,coreDaoFarmAddress2,solvBtcBFarmAddress,ahmFarmAddress1], abi: abis.getTotalTvl })).flat()
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
