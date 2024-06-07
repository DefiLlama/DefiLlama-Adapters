const { default: axios } = require('axios');
const { uniV3Export } = require('../helper/uniswapV3');

const FACTORYV3_ADDRESS = "0x952aC46B2586737df679e836d9B980E43E12B2d8"

//Function for calculating TVL from Steer Vaults (Not being used in this case)
async function tvl(api) {
    const data = await axios.get('https://api.steer.finance/getSmartPools?chainId=534352&dexName=equilibre')
    const pools = data.data;
    const vaults = Object.values(pools.pools).flatMap(pool => pool.map(obj => obj.vaultAddress));
    const bals = await api.multiCall({
      abi: "function getTotalAmounts() view returns (uint256 total0, uint256 total1)",
      calls: vaults,
      permitFailure: true,
    })
    const token0s = await api.multiCall({
      abi: "address:token0",
      calls: vaults,
      permitFailure: true,
    })
    const token1s = await api.multiCall({
      abi: "address:token1",
      calls: vaults,
      permitFailure: true,
    })
    bals.forEach((bal, i) => {
      const token0 = token0s[i]
      const token1 = token1s[i]
      if (!bal || !token0 || !token1) return // skip failures
      api.add(token0, bal.total0)
      api.add(token1, bal.total1)
    })
    return api.getBalances()
      
  }

module.exports = uniV3Export({
  scroll: { factory: FACTORYV3_ADDRESS, fromBlock: 4627488 },
})
