const ADDRESSES = require('../helper/coreAssets.json')
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


const lpInfos = [
{
  lpAddress:"0xd8F1C33D35CB471681385598D456D49c56Ed2D51",
    farmAddress:"0x7E0B85612bB5E7AE0448100D1C2E011FDA53C9F6",
    token0:ADDRESSES.core.USDT,
    token0Decimals:6,
    token1:ADDRESSES.core.USDC,
    token1Decimals:6
},
  { 
  lpAddress:"0xeE2c1703d96443fF0B2C3bC7166b4a6e792B5A97",
  farmAddress:"0x66Bcd683a337D1e1939Eb38C10Ad2C49304cc69D",
  token0:ADDRESSES.core.WCORE_1,
  token0Decimals:18,
  token1:"0xc5555eA27e63cd89f8b227deCe2a3916800c0f4F",
  token1Decimals:18,}
]

const abis = {
  getTotalTvl: "function getTotalTvl() view returns (tuple(uint256 pid, address assets, uint256 tvl)[])",
  safelyGetStateOfAMM:"function safelyGetStateOfAMM() external view returns (uint160 sqrtPriceX96,int24 tick,uint16 observationIndex,uint16 observationCardinality,uint16 observationCardinalityNext,uint8 feeProtocol,bool unlocked)",
  getAllNftInfo: "function getAllNFTInfo() view returns (tuple(uint256 nftId, int24 tickUpper, int24 tickLower, uint128 liquidity,uint256 tvlWeight)[] briefs)"
}

async function tvl(api) {

  const pools = (await api.multiCall({ calls: [aggregator, solvBtcMFarmAddress, solvBtcCoreFarmAddress,coreDaoFarmAddress,wbtcFarmAddress,coreDaoFarmAddress2,solvBtcBFarmAddress,ahmFarmAddress1], abi: abis.getTotalTvl })).flat()
  pools.forEach(({ assets, tvl }) => { api.add(assets, tvl) })
  await sumTokens2({ api, resolveLP: true })
  await tvlLp(api)
  api.removeTokenBalance(projectToken)
  }

  async function tvlLp(api){
    const slot0s = await api.multiCall({calls:lpInfos.map(item=>item.lpAddress),abi:abis.safelyGetStateOfAMM})
    const allNftInfos = await api.multiCall({calls:lpInfos.map(item=>item.farmAddress),abi:abis.getAllNftInfo})

    for(let i =0;i<slot0s.length;i++){
      let {tick} = slot0s[i]
      let nftInfos =allNftInfos[i]
      let lpInfo = lpInfos[i]
      let {token0,token1} = lpInfo
      let amount0 =0
      let amount1 =0
      for (let nftInfo of nftInfos){
        let {tickUpper,tickLower,liquidity} = nftInfo
        let tickUpperPrice = 1.0001 ** (tickUpper/2)
        let tickLowerPrice = 1.0001 ** (tickLower/2)

        if(tick <tickLower){
          amount0 = liquidity * (tickUpperPrice - tickLowerPrice) / (tickUpperPrice * tickLowerPrice)
        } else if(tick >= tickUpper){
          amount1 = liquidity * (tickUpperPrice - tickLowerPrice)
        }else{
          let sp = 1.0001 ** (tick/2)
          amount0 = liquidity * (tickUpperPrice - sp) / (sp * tickUpperPrice)
          amount1 = liquidity * (sp - tickLowerPrice)
        }
        api.add(token0,amount0)
        api.add(token1,amount1)
      }

    }
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
