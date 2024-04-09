const { sumUnknownTokens } = require('../helper/unknownTokens')
const ADDRESSES = require('../helper/coreAssets.json')

const NATIVE_ADDRES = "0xfec65bfb6e5bbcc9ab8ae98f62a8aab2ea51c495";
const NATIVE_LP_ADDRESS = "0x47ED4E0a52716e91a4F37914b04B2252B5B5fcDF"; // iziswap LP
const FARM_ADDRES = "0xC692CA3066C84012C616989Bc7fD9659f16DDCFd";


const getTvl = isStaking => async (api) => {
  let pools = await api.call({ abi: abi.getPoolTotalTvl, target: FARM_ADDRES, });
  if (isStaking)
    pools = pools.find(i => i[1].toLowerCase() === NATIVE_ADDRES)
  else
    pools = pools.filter(i => i[1].toLowerCase() !== NATIVE_ADDRES)

  if (!isStaking) {
    pools.forEach(([_, token, bal]) => api.add(token, bal))
    return sumUnknownTokens({
      api, useDefaultCoreAssets: true, resolveLP: true, abis: {
        getReservesABI: !isStaking ? abi.getReserves : null,
      }
    })
  }

  if (!pools) return {}
  const pedBal = pools[2]
  const {sqrtPrice_96} = await api.call({abi:abi.state,target:NATIVE_LP_ADDRESS})
  let price = (sqrtPrice_96/2**96)**2
  let pedPrice = 1/price*10**12
  let pedAmount = pedPrice*(pedBal/10**18)

  api.add(ADDRESSES.scroll.USDT, pedAmount*10**6)
  return api.getBalances()
}

module.exports = {
  misrepresentedTokens: true,
  hallmarks: [
    [1699578000,"Rug Pull"]
  ],
  scroll: {
    tvl: getTvl(false),
    staking: getTvl(true),
  },
};

const abi = {
  "getPoolTotalTvl": "function getPoolTotalTvl() view returns (tuple(uint256 pid, address assets, uint256 tvl)[])",
  "getReserves": "function getReserves() external view returns (uint _reserve0, uint _reserve1)",
  "state":'function state() external view returns(uint160 sqrtPrice_96,int24 currentPoint,uint16 observationCurrentIndex,uint16 observationQueueLen,uint16 observationNextQueueLen,bool locked,uint128 liquidity,uint128 liquidityX)'
}