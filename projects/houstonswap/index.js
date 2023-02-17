const { BigNumber } = require('ethers/lib');
const { dexExport } = require('../helper/chain/aptos')

const getPoolInfo = pool => pool.data.fee_tier.data;

const token0Reserve = (i) => {
  const poolInfos = getPoolInfo(i);
  let reserve0Total = BigNumber.from(0);
  poolInfos.forEach(poolInfo => {
    const reserve0 = BigNumber.from(poolInfo.value.reserve_x.value);
    reserve0Total = reserve0Total.add(reserve0);
  });

  return reserve0Total.toString()
}

const token1Reserve = (i) => {
  const poolInfos = getPoolInfo(i);
  let reserve1Total = BigNumber.from(0);
  poolInfos.forEach(poolInfo => {
    const reserve1 = BigNumber.from(poolInfo.value.reserve_y.value);
    reserve1Total = reserve1Total.add(reserve1);
  });
  
  return reserve1Total.toString()

}

module.exports = dexExport({
  token0Reserve,
  token1Reserve,
  account: '0xdfa1f6cdefd77fa9fa1c499559f087a0ed39953cd9c20ab8acab6c2eb5539b78',
  poolStr: 'pool::Pool<',
})
