const POOLINFO = '0xebb35Da2A36bEfF4b443DB0A89637c40dF00AFcF';

const { arbitrum } = require("../cian");
const { toUSDTBalances } = require("../helper/balances");
async function fetchArbitrum(api) {
  const [ totalValueLocked, totalTradingVolume, totalUsers, totalTradingVolume24, totalPoolClaimed ] = await api.call({
    abi: 'function getPoolTotalData() view returns (uint256,uint256,uint256,uint256,uint256)',
    target: POOLINFO,
    chain: 'arbitrum',
  });
  return toUSDTBalances(totalValueLocked/100,1);
}

module.exports = {
  start: 1741132619,
  arbitrum: {
    tvl:fetchArbitrum
  }
}; 
