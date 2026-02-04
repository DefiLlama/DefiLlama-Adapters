const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs")

const blastKalax = "0x2F67F59b3629Bf24962290DB9edE0CD4127e606D"
const blastfarms = ['0xE63153C3360aCa0F4e7Ca7A1FC61c2215FAEF5A1', '0xFe899401A1d86cC1113020fb40878c76239142a5',"0x1CB8f6cecf7c8FBB9863417f8371Cb2A076C9115"]
const scrollKalax = "0x1f4F171676f8cb3B1C3FD38867B3B160679F934A"
const scrollFarms = ['0xB99AeDd16714A7393768273F9AbFF4C4F48980eD']

async function tvl(api) {
  let farms = api.chain === 'blast'?blastfarms:scrollFarms
  let kalax = api.chain === 'blast'?blastKalax:scrollKalax

  let pools = (await api.multiCall({ abi: abiInfo.poolInfos, calls: farms })).flat()
  if(api.chain === 'blast'){
    pools
      .filter((i) => i.assets !== kalax)
      .forEach((i) => api.add(i.assets, i.tvl))
  }else{
    pools
    .filter((i) => i.assets !== kalax)
    .forEach((i)=>{
      if(i.assets === ADDRESSES.linea.WETH_1){
        i.assets =ADDRESSES.null
      }
      api.add(i.assets, i.tvl)
    })
  }

  return sumTokens2({ api, resolveLP: true })
}


const usdt = ADDRESSES.scroll.USDT
const scrollKalaLp = "0x4fc09BE6eB49764CcAE4e95Bd2B93f67a34c0188"
async function staking(api) {
  let farms = api.chain === 'blast'?blastfarms:scrollFarms
  let kalax = api.chain === 'blast'?blastKalax:scrollKalax

  let pools = (await api.multiCall({ abi: abiInfo.poolInfos, calls: farms })).flat()
  if(api.chain === 'blast'){
    pools.filter((i) => i.assets === kalax).forEach((i) => api.add(i.assets, i.tvl))
  }else{
    let pool = pools.find(i=>i.assets === kalax)
    let poolTvl = pool.tvl
    let sqrtPriceX96 =await api.call({
      abi:abiInfo.state,
      target:scrollKalaLp
    })
    let p = (sqrtPriceX96 / 2 ** 96) ** 2
   let rate = p * 10**12
   let usdtNum = poolTvl/10**18 * rate * 10**6
   api.add(usdt,usdtNum)
  }
}

module.exports = {
  // hallmarks:[
  //   [1728777600,'Rugpull']
  // ],
  blast: {
    tvl,
    staking,
  },
  scroll:{
    tvl,
    staking
  }
}

const abiInfo = {
  poolInfos:
    "function getPoolTotalTvl() view returns (tuple(uint256 pid, address assets, uint256 tvl)[])",
    state:
    "function state()external view returns(uint160 sqrtPrice_96)"
}
