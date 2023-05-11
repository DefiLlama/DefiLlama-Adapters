const { toUSDTBalances } = require("../helper/balances");

const addressBook = "0x380814144fA550B83A2Be6367c71e60660494cAa";
async function klaytn(ts, _block, chainBlocks, { api }) {
  const data = await api.fetchList({  
    lengthAbi: 'uint256:addressLength', 
    itemAbi: 'function getTvl(uint256 _index) view returns (uint256 tvl)', 
    target: addressBook,
    permitFailure: true,
  }) 
  let klaytnTVL = data.reduce((a, i) => a + i/1e18, 0)
  return toUSDTBalances(klaytnTVL);
}
module.exports = {
  klaytn: {
    tvl: klaytn,
  },
};

